const TEMPLATE_REGISTRY = Object.freeze({
  'ieee-conference': Object.freeze({
    id: 'ieee-conference',
    label: 'IEEE Conference',
    sourceUrl: 'https://www.overleaf.com/latex/templates/ieee-conference-template/grfzhhncsfqn',
    sourceKind: 'overleaf',
    expectedClassOption: 'conference',
    maxBytes: 5_000_000
  }),
  'ieee-journal': Object.freeze({
    id: 'ieee-journal',
    label: 'IEEE Journal',
    sourceUrl: 'https://www.overleaf.com/latex/templates/ieee-journal-paper-template/jbbbdkztwxrd',
    sourceKind: 'overleaf',
    expectedClassOption: 'journal',
    maxBytes: 5_000_000
  })
});

export function getTemplateDefinition(id) {
  const definition = Object.hasOwn(TEMPLATE_REGISTRY, id)
    ? TEMPLATE_REGISTRY[id]
    : undefined;

  if (!definition) {
    throw new Error(`Unsupported paper template: ${id}`);
  }

  return { ...definition };
}
