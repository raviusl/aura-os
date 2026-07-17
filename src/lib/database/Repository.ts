import "server-only";

import { BaseRepository } from "./BaseRepository";

/**
 * Typed repository marker (Sprint 002 foundation).
 * No domain repositories are defined in this sprint.
 */
export abstract class Repository extends BaseRepository {
  protected constructor() {
    super();
  }
}
