'use strict';


class Entry {

    /**
     *
     * @param data
     * @param metadata
     * @param key
     */
    constructor(data, metadata, key = 0) {
        this._data = data;
        this._metadata = metadata;
        this._key = key;
    }

    static get docType(){
        return 'entry';
    }
    get key() {
        return this._key;
    }

    set key(value) {
        this._key = value;
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }

    get metadata() {
        return this._metadata;
    }

    set metadata(value) {
        this._metadata = value;
    }

    propsToArray() {
        return [this.key, this.data, this.metadata];
    }

    propsToValue(){
        return {data : this.data, metadata : this.metadata   }
    }

    static generateKeyByNumber(number){
        return `ENTRY${number}`;
    }

    static parseChainResultToEntry(chainResult) {
        let newEntry = new Entry(null,null);
        if (Entry.docType === 'entry') {
            newEntry.data = chainResult.data;
            newEntry.metadata = chainResult.metadata;
        }
        return newEntry;
    }

}

module.exports = Entry;
