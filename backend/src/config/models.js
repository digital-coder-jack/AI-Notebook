/**
 * Model catalog configuration.
 *
 * IMPORTANT: Provider names (Groq, OpenAI, etc.) and API keys are
 * intentionally kept on the server only. The `provider` field below
 * is used internally to route requests and is NEVER serialized to the
 * client. Clients only ever see the plan name and the public model id,
 * name and description.
 */

export const PLANS = [
  {
    name: 'Study Sphere Lite',
    tier: 'lite',
    description: 'Fast, everyday study assistance for quick questions and summaries.',
    models: [
      {
        id: 'lite-swift',
        name: 'Swift',
        description: 'Quick responses for everyday study questions.',
        // internal-only fields below (stripped before sending to clients)
        provider: 'lite',
        upstreamModel: 'llama-3.1-8b-instant',
      },
      {
        id: 'lite-scholar',
        name: 'Scholar',
        description: 'Balanced reasoning for explanations and summaries.',
        provider: 'lite',
        upstreamModel: 'llama-3.3-70b-versatile',
      },
    ],
  },
  {
    name: 'Study Sphere Pro',
    tier: 'pro',
    description: 'Advanced reasoning for complex problems, research and deep tutoring.',
    models: [
      {
        id: 'pro-mentor',
        name: 'Mentor',
        description: 'Deep reasoning for complex multi-step problems.',
        provider: 'pro',
        upstreamModel: 'gpt-4o-mini',
      },
      {
        id: 'pro-genius',
        name: 'Genius',
        description: 'Top-tier tutoring for research and advanced study.',
        provider: 'pro',
        upstreamModel: 'gpt-4o',
      },
    ],
  },
];

/**
 * Public catalog: strips all internal-only fields.
 */
export function getPublicCatalog() {
  return {
    plans: PLANS.map((plan) => ({
      name: plan.name,
      tier: plan.tier,
      description: plan.description,
      models: plan.models.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
      })),
    })),
  };
}

/**
 * Resolve a public model id to its internal routing record.
 * Returns null if not found.
 */
export function resolveModel(modelId) {
  for (const plan of PLANS) {
    for (const model of plan.models) {
      if (model.id === modelId) {
        return {
          planName: plan.name,
          tier: plan.tier,
          modelId: model.id,
          provider: model.provider,
          upstreamModel: model.upstreamModel,
        };
      }
    }
  }
  return null;
}
