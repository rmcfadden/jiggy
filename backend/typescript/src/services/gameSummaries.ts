import { DictionaryMapper, Join, NestedToObjectEnrichmentStrategy, OrderBy, ReadonlyRepository, SelectStatement, type IConnection } from '@deterministic-code/datasources'
import { GameSummary } from '../../generated/types/view/gameSummary.ts'
import type { ImagesService } from './images.ts'

/** Entity names the join statement uses, mapped to their tables. */
const ENTITIES: [string, string][] = [
  ['Game', 'games'],
  ['GameParent', 'game_parents'],
  ['PuzzleGame', 'puzzle_games'],
  ['Resource', 'resources'],
  ['GameCategory', 'game_categories'],
  ['Category', 'categories'],
]

/** Property names to columns. A path such as `GameParent.name` is qualified by its entity (`game_parents.name`). */
const PROPERTIES: [string, string][] = [
  ['gameParentId', 'game_parent_id'],
  ['gameId', 'game_id'],
  ['imageId', 'image_id'],
  ['templateId', 'template_id'],
  ['categoryId', 'category_id'],
  ['isDeleted', 'is_deleted'],
  ['isEnabled', 'is_enabled'],
]

/** What the nested mapper produces: a summary plus the columns the service needs to filter and pick the thumbnail. */
type Mapped = GameSummary & { imageId: number | null; gameDeleted: unknown; gameEnabled: unknown }

// Fields are paths; each aliases entry is the result-column name the nested mapper reads.
const joined = new SelectStatement({
  table: 'Game',
  fields: ['Game.id', 'Game.name', 'Game.description', 'Game.isDeleted', 'Game.isEnabled', 'GameParent.name', 'PuzzleGame.templateId', 'PuzzleGame.imageId', 'Resource.location', 'GameCategory.categoryId', 'Category.name'],
  aliases: ['id', 'name', 'description', 'gameDeleted', 'gameEnabled', 'parentName', 'templateId', 'imageId', 'imageLocation', 'categoryId', 'categoryName'],
  joins: [
    Join.inner('GameParent', 'GameParent.id', 'Game.gameParentId'),
    Join.inner('PuzzleGame', 'PuzzleGame.gameId', 'Game.id'),
    Join.left('Resource', 'Resource.id', 'PuzzleGame.imageId'),
    Join.left('GameCategory', 'GameCategory.gameId', 'Game.id'),
    Join.left('Category', 'Category.id', 'GameCategory.categoryId'),
  ],
  orderBy: [OrderBy.asc('Game.id'), OrderBy.asc('GameCategory.categoryId')],
})

/**
 * Read-only summaries of the playable games: name, description, parent, thumbnail and categories, from one join
 * over games, game parents, puzzles, images and categories. A flat-to-nested enrichment folds the join rows into
 * one summary per game with its `categories`. The thumbnail is a second resource named `{image}_thumbnail`, which
 * a join cannot reach, so it is filled from `ImagesService.thumbnailUrls` (the image itself when there is none).
 */
export class GameSummariesService extends ReadonlyRepository<GameSummary> {
  constructor(connection: IConnection, private readonly images: ImagesService) {
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
          templateId: 'templateId',
          thumbnameLocation: 'imageLocation',
          imageId: 'imageId',
          gameDeleted: 'gameDeleted',
          gameEnabled: 'gameEnabled',
          categories: { key: 'categoryId', fields: { id: 'categoryId', name: 'categoryName' } },
        },
      }),
    )
  }

  /** Every enabled, undeleted game by id. The query argument is ignored. */
  override async *read(): AsyncIterable<GameSummary> {
    const thumbs = await this.images.thumbnailUrls()
    for await (const row of super.read(joined) as AsyncIterable<Mapped>) {
      // A Where on a qualified column makes an invalid parameter name (`$games.is_deleted`), so filter here.
      if (row.gameDeleted || !row.gameEnabled) continue
      row.thumbnameLocation = (row.imageId == null ? undefined : thumbs.get(Number(row.imageId))) ?? row.thumbnameLocation ?? ''
      yield row
    }
  }
}
