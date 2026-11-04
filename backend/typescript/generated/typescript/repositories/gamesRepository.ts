import type { Games } from "../types/generated/views/games";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { GameSettingsRepository } from "./gameSettingsRepository";
import { CategoriesRepository } from "./categoriesRepository";
import { GamesCategoriesRepository } from "./gamesCategoriesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Games>()
    .add({ entity: "Games", entityMapper: new DictionaryMapper([["Games", "games_bases"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), ids: ["id"], createProperties: ["name", "description", "location", "isEnabled", "isDeleted"], updateProperties: ["uuid", "name", "description", "location", "isEnabled", "isDeleted"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "Games", entityMapper: new DictionaryMapper([["Games", "games_bases"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "name", "description", "location", "isEnabled", "isDeleted"], updateProperties: ["uuid", "created", "version", "name", "description", "location", "isEnabled", "isDeleted"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Games>()
    .add({ entity: "Games", entityMapper: new DictionaryMapper([["Games", "games_bases"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "Games", entityMapper: new DictionaryMapper([["Games", "games_bases"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

export class GamesRepository extends CRUDRepository<Games> {
  readonly gameSettings: GameSettingsRepository;
  readonly categories: CategoriesRepository;
  readonly gamesCategories: GamesCategoriesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.gameSettings = new GameSettingsRepository(connection);
    this.categories = new CategoriesRepository(connection);
    this.gamesCategories = new GamesCategoriesRepository(connection);
    this.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "gameId", relatedProperty: "value", type: "dictionary" }, this.gameSettings);
    this.addLinked({ destinationProperty: "categories", sourceProperty: "id", relatedKey: "id", association: { parent: "gameId", related: "categoryId" }, type: "list" }, this.categories, this.gamesCategories);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Games>(connection, readonlyOptions(connection));
    const gameSettings = new GameSettingsRepository(connection);
    const categories = new CategoriesRepository(connection);
    const gamesCategories = new GamesCategoriesRepository(connection);
    repo.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "gameId", relatedProperty: "value", type: "dictionary" }, gameSettings);
    repo.addEnriched({ destinationProperty: "categories", sourceProperty: "id", relatedKey: "id", type: "list" }, categories);
    return repo;
  }
}
