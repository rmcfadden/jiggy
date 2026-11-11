import { DictionaryMapper, Join, NestedToObjectEnrichmentStrategy, OrderBy, ReadonlyRepository, SelectStatement, type ICRUDRepository, type IConnection } from '@deterministic-code/datasources'
import { GameSummary } from '../../generated/types/view/gameSummary.ts'
import type { Game } from '../../generated/types/view/game.ts'
import type { ImagesService } from './images.ts'

/** Entity names the join statement uses, mapped to their tables. */
const ENTITIES: [string, string][] = [
  ['Game', 'games'],
  ['GameParent', 'game_parents'],
  ['GameCategory', 'game_categories'],
  ['Category', 'categories'],
  ['GameAttribute', 'game_attributes'],
]

/** Property names to columns. A path such as `GameParent.name` is qualified by its entity (`game_parents.name`). */
const PROPERTIES: [string, string][] = [
  ['gameParentId', 'game_parent_id'],
  ['gameId', 'game_id'],
  ['templateId', 'template_id'],
  ['categoryId', 'category_id'],
  ['isDeleted', 'is_deleted'],
  ['isEnabled', 'is_enabled'],
]

/** What the nested mapper produces: a summary plus the columns the service needs to filter and pick the thumbnail. */
type Mapped = GameSummary & { gameDeleted: unknown; gameEnabled: unknown }

// Fields are paths; each aliases entry is the result-column name the nested mapper reads.
const joined = new SelectStatement({
  table: 'Game',
  fields: ['Game.id', 'Game.name', 'Game.description', 'Game.isDeleted', 'Game.isEnabled', 'GameParent.name', 'GameCategory.categoryId', 'Category.name', 'GameAttribute.name', 'GameAttribute.value'],
  aliases: ['id', 'name', 'description', 'gameDeleted', 'gameEnabled', 'parentName', 'categoryId', 'categoryName', 'attributeName', 'attributeValue'],
  joins: [
    Join.inner('GameParent', 'GameParent.id', 'Game.gameParentId'),
    Join.left('GameCategory', 'GameCategory.gameId', 'Game.id'),
    Join.left('Category', 'Category.id', 'GameCategory.categoryId'),
    Join.left('GameAttribute', 'GameAttribute.gameId', 'Game.id'),
  ],
  orderBy: [OrderBy.asc('Game.id'), OrderBy.asc('GameCategory.categoryId'), OrderBy.asc('GameAttribute.name')],
})

/**
 * Read-only summaries of the playable games: name, description, parent, thumbnail and categories, from one join
 * over games, game parents and categories. A flat-to-nested enrichment folds the join rows into one summary per
 * game with its `categories`. The image is the game's `image_id` setting and the thumbnail a second resource named
 * `{image}_thumbnail`; neither can be joined, so both are filled from `ImagesService` (the image itself when there
 * is no thumbnail).
 */
export class GameSummariesService extends ReadonlyRepository<GameSummary> {
  constructor(connection: IConnection, private readonly images: ImagesService, private readonly games: ICRUDRepository<Game>) {
    super(connection, {
      type: GameSummary,
      entity: 'Game',
      entityMapper: new DictionaryMapper(ENTITIES),
      propertyMappings: new DictionaryMapper(PROPERTIES),
    })
    this.addEnriched(
      { destinationProperty: 'categories', sourceProperty: 'id', relatedKey: 'categoryId', type: 'list' },
      this,
      new NestedToObjectEnrichmentStrategy<Mapped>({
        key: 'id',
        fields: {
          id: 'id',
          name: 'name',
          description: 'description',
          parentName: 'parentName',
          gameDeleted: 'gameDeleted',
          gameEnabled: 'gameEnabled',
          categories: { key: 'categoryId', fields: { id: 'categoryId', name: 'categoryName' } },
          attributes: { key: 'attributeName', value: 'attributeValue' },
        },
      }),
    )
  }

  /** Every enabled, undeleted game by id. The query argument is ignored. */
  override async *read(): AsyncIterable<GameSummary> {
    const thumbs = await this.images.thumbnailUrls()
    const urls = await this.images.urls()
    // A game's image is its `image_id` setting, which is text without a foreign key, so it cannot be joined.
    const imageOf = new Map<number, number>()
    for await (const game of this.games.read()) if (game.settings['image_id']) imageOf.set(Number(game.id), Number(game.settings['image_id']))
    for await (const row of super.read(joined) as AsyncIterable<Mapped>) {
      // A Where on a qualified column makes an invalid parameter name (`$games.is_deleted`), so filter here.
      if (row.gameDeleted || !row.gameEnabled) continue
      const imageId = imageOf.get(Number(row.id))
      row.thumbnameLocation = (imageId === undefined ? undefined : (thumbs.get(imageId) ?? urls.get(imageId))) ?? ''
      yield row
    }
  }
}
