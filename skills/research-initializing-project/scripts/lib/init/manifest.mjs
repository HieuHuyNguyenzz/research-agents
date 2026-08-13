const REQUIRED_STRING_FIELDS = ['projectName', 'overview'];
const OPTIONAL_LIST_FIELDS = [
  'objectives',
  'researchQuestions',
  'dataSources',
  'methods',
  'authors'
];
const TEMPLATE_IDS = new Set(['ieee-conference', 'ieee-journal']);

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeList(value) {
  const values = Array.isArray(value) ? value : [value];

  return values.flatMap((entry) => (
    typeof entry === 'string' ? entry.split(/[\n,]/) : []
  )).map((entry) => entry.trim()).filter(Boolean);
}

function normalizeTemplateId(value) {
  const normalized = normalizeString(value).toLowerCase().replace(/\s+/g, ' ');

  if (normalized === 'ieee conference') return 'ieee-conference';
  if (normalized === 'ieee journal') return 'ieee-journal';
  return normalized;
}

function asManifestObject(input) {
  if (typeof input === 'string') return JSON.parse(input);
  if (input && typeof input === 'object' && !Array.isArray(input)) return input;
  throw new TypeError('Manifest input must be a JSON string or object');
}

export function parseManifest(input) {
  const source = asManifestObject(input);
  const manifest = {
    projectName: normalizeString(source.projectName),
    overview: normalizeString(source.overview),
    paperTemplate: normalizeTemplateId(source.paperTemplate)
  };

  for (const field of OPTIONAL_LIST_FIELDS) {
    manifest[field] = normalizeList(source[field]);
  }

  return {
    projectName: manifest.projectName,
    overview: manifest.overview,
    objectives: manifest.objectives,
    researchQuestions: manifest.researchQuestions,
    dataSources: manifest.dataSources,
    methods: manifest.methods,
    authors: manifest.authors,
    paperTemplate: manifest.paperTemplate
  };
}

export function validateManifest(manifest) {
  const errors = [];
  const source = manifest && typeof manifest === 'object' && !Array.isArray(manifest)
    ? manifest
    : {};

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!normalizeString(source[field])) errors.push(`${field} is required`);
  }

  if (!TEMPLATE_IDS.has(normalizeTemplateId(source.paperTemplate))) {
    errors.push('paperTemplate must be ieee-conference or ieee-journal');
  }

  return errors;
}
