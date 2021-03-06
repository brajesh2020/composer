'use strict';

const url = 'http://%GATEWAY%/api';

/**
 * Handle a basic transaction.
 * @param {systest.transactions.http.Basic} tx The transaction.
 * @transaction
 */
async function handleBasic(tx) {

    // Try the shortcut method first.
    const data1 = await request[tx.method.toLowerCase()](`${url}/basic`);
    if (tx.method !== 'HEAD') {
        assert.equal(data1, `{"method":"${tx.method}"}`);
    }

    // Then try the normal method.
    const data2 = await request({ uri: `${url}/basic`, method: tx.method, json: true });
    if (tx.method !== 'HEAD') {
        assert.equal(data2.method, tx.method);
    }

}

/**
 * Handle an error transaction.
 * @param {systest.transactions.http.Error} tx The transaction.
 * @transaction
 */
async function handleError(tx) {
    try {
        await request({ uri: `${url}/error`, method: tx.method, json: true });
        throw new Error('should not get here');
    } catch (e) {
        if (tx.method !== 'HEAD') {
            assert.deepEqual(e.error, { method: tx.method, error: 'such error' });
        } else {
            assert.equal(e.statusCode, 500);
        }
    }
}

/**
 * Handle an asset in transaction.
 * @param {systest.transactions.http.AssetIn} tx The transaction.
 * @transaction
 */
async function handleAssetIn(tx) {
    const factory = getFactory();
    const asset = factory.newResource('systest.transactions.http', 'DummyAsset', '1234');
    asset.stringValue = 'hello world';
    asset.integerValue = 12345678;
    const serializer = getSerializer();
    const json = serializer.toJSON(asset);
    const data = await request({ uri: `${url}/assetin`, method: tx.method, json });
    assert.equal(data.method, tx.method);
}

/**
 * Handle an asset out transaction.
 * @param {systest.transactions.http.AssetOut} tx The transaction.
 * @transaction
 */
async function handleAssetOut(tx) {
    const data = await request({ uri: `${url}/assetout`, method: tx.method, json: true });
    assert.equal(data.method, tx.method);
    const serializer = getSerializer();
    const asset = serializer.fromJSON(data.asset);
    assert.equal(asset.assetId, '1234');
    assert.equal(asset.stringValue, 'hello world');
    assert.equal(asset.integerValue, 12345678);
}