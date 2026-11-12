import { GamePlay } from "../types/view/gamePlay";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { GamePlayStatesRepository } from "./gamePlayStatesRepository";
import { GamePlayActionsRepository } from "./gamePlayActionsRepository";
import { UsersRepository } from "./usersRepository";
import { GamePlayUsersRepository } from "./gamePlayUsersRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<GamePlay>()
    .add({ type: GamePlay, entity: "GamePlay", entityMapper: new DictionaryMapper([["GamePlay", "game_plays"]]), propertyMappings: new DictionaryMapper([["gameId", "game_id"], ["userId", "user_id"]]), ids: ["id"], createProperties: ["gameId", "userId", "finished"], updateProperties: ["uuid", "gameId", "userId", "finished"], readProperties: ["id", "uuid", "created", "updated", "version", "gameId", "userId", "finished"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, gameId: { type: "biginteger", nullable: false, hasDefault: false }, userId: { type: "biginteger", nullable: false, hasDefault: false }, finished: { type: "datetime", nullable: true, hasDefault: false } }) })
    .add("sqlite", { type: GamePlay, entity: "GamePlay", entityMapper: new DictionaryMapper([["GamePlay", "game_plays"]]), propertyMappings: new DictionaryMapper([["gameId", "game_id"], ["userId", "user_id"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "gameId", "userId", "finished"], updateProperties: ["uuid", "created", "version", "gameId", "userId", "finished"], readProperties: ["id", "uuid", "created", "updated", "version", "gameId", "userId", "finished"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, gameId: { type: "biginteger", nullable: false, hasDefault: false }, userId: { type: "biginteger", nullable: false, hasDefault: false }, finished: { type: "datetime", nullable: true, hasDefault: false } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<GamePlay>()
    .add({ type: GamePlay, entity: "GamePlay", entityMapper: new DictionaryMapper([["GamePlay", "game_plays"]]), propertyMappings: new DictionaryMapper([["gameId", "game_id"], ["userId", "user_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "gameId", "userId", "finished"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, gameId: { type: "biginteger", nullable: false, hasDefault: false }, userId: { type: "biginteger", nullable: false, hasDefault: false }, finished: { type: "datetime", nullable: true, hasDefault: false } }) })
    .add("sqlite", { type: GamePlay, entity: "GamePlay", entityMapper: new DictionaryMapper([["GamePlay", "game_plays"]]), propertyMappings: new DictionaryMapper([["gameId", "game_id"], ["userId", "user_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "gameId", "userId", "finished"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, gameId: { type: "biginteger", nullable: false, hasDefault: false }, userId: { type: "biginteger", nullable: false, hasDefault: false }, finished: { type: "datetime", nullable: true, hasDefault: false } }) })
    .for(connection);

export class GamePlaysRepository extends CRUDRepository<GamePlay> {
  readonly gamePlayState: GamePlayStatesRepository;
  readonly gamePlayAction: GamePlayActionsRepository;
  readonly user: UsersRepository;
  readonly gamePlayUsers: GamePlayUsersRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.gamePlayState = new GamePlayStatesRepository(connection);
    this.gamePlayAction = new GamePlayActionsRepository(connection);
    this.user = new UsersRepository(connection);
    this.gamePlayUsers = new GamePlayUsersRepository(connection);
    this.addEnriched({ destinationProperty: "states", sourceProperty: "id", relatedKey: "gamePlayId", type: "list" }, this.gamePlayState);
    this.addEnriched({ destinationProperty: "actions", sourceProperty: "id", relatedKey: "gamePlayId", type: "list" }, this.gamePlayAction);
    this.addLinked({ destinationProperty: "users", sourceProperty: "id", relatedKey: "id", association: { parent: "gamePlayId", related: "userId" }, type: "list" }, this.user, this.gamePlayUsers);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<GamePlay>(connection, readonlyOptions(connection));
    const gamePlayState = new GamePlayStatesRepository(connection);
    const gamePlayAction = new GamePlayActionsRepository(connection);
    const user = new UsersRepository(connection);
    const gamePlayUsers = new GamePlayUsersRepository(connection);
    repo.addEnriched({ destinationProperty: "states", sourceProperty: "id", relatedKey: "gamePlayId", type: "list" }, gamePlayState);
    repo.addEnriched({ destinationProperty: "actions", sourceProperty: "id", relatedKey: "gamePlayId", type: "list" }, gamePlayAction);
    repo.addEnriched({ destinationProperty: "users", sourceProperty: "id", relatedKey: "id", type: "list" }, user);
    return repo;
  }
}
