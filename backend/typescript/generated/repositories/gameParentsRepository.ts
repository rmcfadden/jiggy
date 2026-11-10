import { GameParent } from "../types/view/gameParent";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { GameParentSettingsRepository } from "./gameParentSettingsRepository";
import { CategoriesRepository } from "./categoriesRepository";
import { GameParentCategoriesRepository } from "./gameParentCategoriesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<GameParent>()
    .add({ type: GameParent, entity: "GameParent", entityMapper: new DictionaryMapper([["GameParent", "game_parents"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), ids: ["id"], createProperties: ["name", "description", "location", "isEnabled", "isDeleted"], updateProperties: ["uuid", "name", "description", "location", "isEnabled", "isDeleted"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: GameParent, entity: "GameParent", entityMapper: new DictionaryMapper([["GameParent", "game_parents"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "name", "description", "location", "isEnabled", "isDeleted"], updateProperties: ["uuid", "created", "version", "name", "description", "location", "isEnabled", "isDeleted"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<GameParent>()
    .add({ type: GameParent, entity: "GameParent", entityMapper: new DictionaryMapper([["GameParent", "game_parents"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: GameParent, entity: "GameParent", entityMapper: new DictionaryMapper([["GameParent", "game_parents"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "location", "isEnabled", "isDeleted"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, location: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

export class GameParentsRepository extends CRUDRepository<GameParent> {
  readonly gameParentSetting: GameParentSettingsRepository;
  readonly category: CategoriesRepository;
  readonly gameParentCategory: GameParentCategoriesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.gameParentSetting = new GameParentSettingsRepository(connection);
    this.category = new CategoriesRepository(connection);
    this.gameParentCategory = new GameParentCategoriesRepository(connection);
    this.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "gameParentId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, this.gameParentSetting);
    this.addLinked({ destinationProperty: "categories", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", association: { parent: "gameParentId", related: "categoryId" }, type: "list" }, this.category, this.gameParentCategory);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<GameParent>(connection, readonlyOptions(connection));
    const gameParentSetting = new GameParentSettingsRepository(connection);
    const category = new CategoriesRepository(connection);
    const gameParentCategory = new GameParentCategoriesRepository(connection);
    repo.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "gameParentId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, gameParentSetting);
    repo.addEnriched({ destinationProperty: "categories", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", type: "list" }, category);
    return repo;
  }
}
