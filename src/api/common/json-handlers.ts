import { readFileSync } from 'fs-extra';
import * as commentJson from 'comment-json';

export const parseJson = <T>(content: string): T => commentJson.parse(content);

export const requireJson = <T>(file: string): T => parseJson(readFileSync(file).toString());