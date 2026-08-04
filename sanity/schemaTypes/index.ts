import type { SchemaTypeDefinition } from "sanity";
import { heroType } from "./heroType";
import { proyectoType } from "./proyectoType";
import { footerType } from "./footerType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [heroType, proyectoType, footerType],
};
