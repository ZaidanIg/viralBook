import { AgentResult } from "../types";

export type { AgentResult };

export abstract class BaseAgent<TInput, TOutput> {
  /**
   * Executes the agent's core responsibity.
   */
  abstract execute(input: TInput): Promise<AgentResult<TOutput>>;

  /**
   * Helper payload wrapped in AgentResult structure
   */
  protected success(data: TOutput): AgentResult<TOutput> {
    return {
      success: true,
      data,
      retryable: false,
    };
  }

  /**
   * Helper failure wrapped in AgentResult structure
   */
  protected fail(error: string, retryable: boolean = true): AgentResult<TOutput> {
    return {
      success: false,
      error,
      retryable,
    };
  }
}
