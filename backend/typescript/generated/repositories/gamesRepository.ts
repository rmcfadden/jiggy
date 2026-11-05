import type { Game } from "../types/view/game";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { GameSettingsRepository } from "./gameSettingsRepository";
import { CategoriesRepository } from "./categoriesRepository";
import { GameCategoriesRepository } from "./gameCategoriesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Game>()
    .add({ entity: "Game", entityMapper: new DictionaryMapper([["Game", "game_bases"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), ids: ["id"], createProperties: ["name", "description", "location", "isEnabled", "isDeleted"], updateProperties: ["uuid", "name", "description", "location", "isEnabled", "isDeleted"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "Game", entityMapper: new DictionaryMapper([["Game", "game_bases"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "name", "description", "location", "isEnabled", "isDeleted"], updateProperties: ["uuid", "created", "version", "name", "description", "location", "isEnabled", "isDeleted"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Game>()
    .add({ entity: "Game", entityMapper: new DictionaryMapper([["Game", "game_bases"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "Game", entityMapper: new DictionaryMapper([["Game", "game_bases"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

export class GamesRepository extends CRUDRepository<Game> {
  readonly gameSetting: GameSettingsRepository;
  readonly category: CategoriesRepository;
  readonly gameCategory: GameCategoriesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.gameSetting = new GameSettingsRepository(connection);
    this.category = new CategoriesRepository(connection);
    this.gameCategory = new GameCategoriesRepository(connection);
    this.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "gameId", relatedProperty: "value", type: "dictionary" }, this.gameSetting);
    this.addLinked({ destinationProperty: "categories", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", association: { parent: "gameId", related: "categoryId" }, type: "list" }, this.category, this.gameCategory);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Game>(connection, readonlyOptions(connection));
    const gameSetting = new GameSettingsRepository(connection);
    const category = new CategoriesRepository(connection);
    const gameCategory = new GameCategoriesRepository(connection);
    repo.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "gameId", relatedProperty: "value", type: "dictionary" }, gameSetting);
    repo.addEnriched({ destinationProperty: "categories", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", type: "list" }, category);
    return repo;
  }
}
