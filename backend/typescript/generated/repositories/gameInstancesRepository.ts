import type { GameInstance } from "../types/view/gameInstance";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { GameInstanceSettingsRepository } from "./gameInstanceSettingsRepository";
import { CategoriesRepository } from "./categoriesRepository";
import { GameInstanceCategoriesRepository } from "./gameInstanceCategoriesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<GameInstance>()
    .add({ entity: "GameInstance", entityMapper: new DictionaryMapper([["GameInstance", "game_instances"]]), propertyMappings: new DictionaryMapper([["gameId", "game_id"], ["gameConfigId", "game_config_id"], ["isDeleted", "is_deleted"], ["isEnabled", "is_enabled"]]), ids: ["id"], createProperties: ["name", "description", "gameId", "gameConfigId", "isDeleted", "isEnabled"], updateProperties: ["uuid", "name", "description", "gameId", "gameConfigId", "isDeleted", "isEnabled"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "gameId", "gameConfigId", "isDeleted", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, gameId: { type: "biginteger", nullable: false, hasDefault: false }, gameConfigId: { type: "biginteger", nullable: false, hasDefault: false }, isDeleted: { type: "boolean", nullable: false, hasDefault: true }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "GameInstance", entityMapper: new DictionaryMapper([["GameInstance", "game_instances"]]), propertyMappings: new DictionaryMapper([["gameId", "game_id"], ["gameConfigId", "game_config_id"], ["isDeleted", "is_deleted"], ["isEnabled", "is_enabled"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "name", "description", "gameId", "gameConfigId", "isDeleted", "isEnabled"], updateProperties: ["uuid", "created", "version", "name", "description", "gameId", "gameConfigId", "isDeleted", "isEnabled"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "gameId", "gameConfigId", "isDeleted", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, gameId: { type: "biginteger", nullable: false, hasDefault: false }, gameConfigId: { type: "biginteger", nullable: false, hasDefault: false }, isDeleted: { type: "boolean", nullable: false, hasDefault: true }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<GameInstance>()
    .add({ entity: "GameInstance", entityMapper: new DictionaryMapper([["GameInstance", "game_instances"]]), propertyMappings: new DictionaryMapper([["gameId", "game_id"], ["gameConfigId", "game_config_id"], ["isDeleted", "is_deleted"], ["isEnabled", "is_enabled"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "gameId", "gameConfigId", "isDeleted", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, gameId: { type: "biginteger", nullable: false, hasDefault: false }, gameConfigId: { type: "biginteger", nullable: false, hasDefault: false }, isDeleted: { type: "boolean", nullable: false, hasDefault: true }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "GameInstance", entityMapper: new DictionaryMapper([["GameInstance", "game_instances"]]), propertyMappings: new DictionaryMapper([["gameId", "game_id"], ["gameConfigId", "game_config_id"], ["isDeleted", "is_deleted"], ["isEnabled", "is_enabled"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "gameId", "gameConfigId", "isDeleted", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, gameId: { type: "biginteger", nullable: false, hasDefault: false }, gameConfigId: { type: "biginteger", nullable: false, hasDefault: false }, isDeleted: { type: "boolean", nullable: false, hasDefault: true }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

export class GameInstancesRepository extends CRUDRepository<GameInstance> {
  readonly gameInstanceSetting: GameInstanceSettingsRepository;
  readonly category: CategoriesRepository;
  readonly gameInstanceCategory: GameInstanceCategoriesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.gameInstanceSetting = new GameInstanceSettingsRepository(connection);
    this.category = new CategoriesRepository(connection);
    this.gameInstanceCategory = new GameInstanceCategoriesRepository(connection);
    this.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "gameInstanceId", relatedProperty: "value", type: "dictionary" }, this.gameInstanceSetting);
    this.addLinked({ destinationProperty: "categories", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", association: { parent: "gameInstanceId", related: "categoryId" }, type: "list" }, this.category, this.gameInstanceCategory);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<GameInstance>(connection, readonlyOptions(connection));
    const gameInstanceSetting = new GameInstanceSettingsRepository(connection);
    const category = new CategoriesRepository(connection);
    const gameInstanceCategory = new GameInstanceCategoriesRepository(connection);
    repo.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "gameInstanceId", relatedProperty: "value", type: "dictionary" }, gameInstanceSetting);
    repo.addEnriched({ destinationProperty: "categories", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", type: "list" }, category);
    return repo;
  }
}
