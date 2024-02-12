export type Path = string[];

interface Task {
    prefix: Path;
    val: any;
}

function buildPaths(
    taskQueue: Task[],
    discoveredPaths: Path[],
    prefix: Path,
    currentObj: Object,
): void {
    for (const [key, value] of Object.entries(currentObj)) {
        const extendedPath = [...prefix, key];
        discoveredPaths.push(extendedPath);

        /* if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                const arrayExtendedPath = [...extendedPath, i];
                taskQueue.push({prefix: arrayExtendedPath, val: value[i]});
            }
        } else */
        if (value instanceof Object) {
            taskQueue.push({prefix: extendedPath, val: value});
        } else {
            // Do nothing. Leaf reached.
        }
    }
}

/**
 * Generate a list of all paths in a JavaScript object.
 * @param obj The object to generate all paths for
 * @returns An array of paths (which are arrays of object keys).
 */
export function getAllObjectPaths(
    obj: any
): Path[] {
    if (!(obj instanceof Object))
        return [];
    else {
        // perform a tree traversal using a queue
        const discoveredPaths: Path[] = [];
        const initialTask: Task = {prefix: [], val: obj};
        const tasks: Task[] = [initialTask]; // start at the root

        while (tasks.length > 0) {
            const task = tasks.pop()!;
            buildPaths(tasks, discoveredPaths, task.prefix, task.val);
        }
        return discoveredPaths;
    }
}