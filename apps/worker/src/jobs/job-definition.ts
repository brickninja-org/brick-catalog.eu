export interface JobDefinition<TPayload = unknown, TOutput = string | void> {
  run(payload: TPayload): Promise<TOutput> | TOutput,
}
