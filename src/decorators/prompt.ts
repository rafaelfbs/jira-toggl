
export function promptWithPersistence(store, prompt) {
    const originalGetInput = prompt.getInput;
    const originalGet = prompt.get;

    prompt.getInput = function (prop, callback) {
        const nextProp = {
            ...prop,
            schema: {
                ...prop.schema,
                default: prop.schema.persisted && store.hasOwn(prop.path) ? store.get(prop.path) : prop.schema.default,
                before: value => {
                    const nextValue = prop.schema.before ? prop.schema.before(value) : value;
                    if (prop.schema.persisted) {
                        store.set(prop.path, nextValue);
                    }
                    return nextValue;
                }
            },
        };

        return originalGetInput.call(this, nextProp, callback);
    };

    prompt.get = function (schema, callback) {
        const callbackWithSave = function (err, data) {
            store.save();
            return callback(err, data);
        };

        return originalGet.call(this, schema, callbackWithSave);
    };
}
