import {test, fc} from "@fast-check/vitest";
import {change, from, Patch} from "@automerge/automerge";
import {patch as applyPatch} from "../../src";
import {describe} from "vitest";
import {getProperty} from "../../src/helpers";
import {getAllObjectPaths, Path} from "./helpers/getAllObjectPaths.js";

const canWrite = (obj: object, path: string[], value: any): boolean => {
    const patch: Patch = {
        action: "put",
        path: path,
        value: value,
    }
    const doc = from(obj);
    const newDoc = change(doc, (d: any) => {
        applyPatch(d, patch);
    });

    const valueFromDoc = getProperty(newDoc, path);
    if (typeof value === "object") {
        return JSON.stringify(valueFromDoc) === JSON.stringify(value);
    } else {
        return valueFromDoc === value;
    }
}


describe("Property-based tests for applying patches", () => {
    function makeAutomergeCompatibleObject() {
        const {tree} = fc.letrec((tie) => ({
            tree:
                fc.dictionary(
                    fc.string({minLength: 1})
                        .filter((str: string) => str.trim().length > 0),
                    tie("node")
                ),
            node: fc.oneof(tie("leaf"), tie("tree")),
            leaf: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
        }));
        return tree;
    }

    const objectAndPaths = makeAutomergeCompatibleObject().chain((obj: object) => {
        const allPaths = getAllObjectPaths(obj);
        return fc.tuple(
            fc.constant(obj),
            fc.constant(allPaths));
    });

    const valueToWrite = fc.oneof(
        fc.constant({}),
        fc.integer(),
        fc.string(),
        fc.boolean());

    test.prop([objectAndPaths, valueToWrite], {verbose: 2})('value shoud be writable', ([data, paths]: [object, Path[]], valueToWrite) => {
        return paths.every((path: string[]) => canWrite(data, paths, valueToWrite));
    });
});