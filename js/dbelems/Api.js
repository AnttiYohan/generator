import 
{ 
    Table, 
    Field, 
    Type, 
    Constraint, 
    NotNull, 
    AutoIncrement, 
    Check, 
    PrimaryKey, 
    ForeignKey,
    Reference,
    Action
} from "./Table";

class Api 
{
    /**
     * Creates a new Api instance
     * 
     * @param {string} name
     */
    constructor(name, tableData = [], modelData = {})
    {
        this._name             = name;
        this._tableContainer  = {};
        this._modelContainer  = {};

        if (Array.isArray(tableData))
        {
            this.loadTables(tableData);
        }
    }

    static createFromJson(json)
    {
        const api = new Api(json.title);
        
        for (const key in json.tables)
        {
            const table = json.tables[key];
            api._tableList.push(Table.createFromJson(table))
        }

        return api;
    }

    /**
     * Loads the tables to container from an array
     * 
     * @param {array} tableData 
     */
    loadTables(tableData)
    {
        for (const table of tableData)
        {
            this.addTable(table);
        }
    }

    /**
     * Adds a Table object to the Api
     * 
     * @param  {string} key
     * @param  {Table}  table 
     * @return {boolean}
     */
    addTable(table)
    {
        let result = false;

        if ( ! this._tableContainer.hasOwnProperty(table.title))
        {
            if ( ! table.parent.length) table.parent = this.title;
            this._tableContainer[table.title] = table;
            result = true;
        }

        return result;
    }

    /**
     * Returns a Table object if exists
     * 
     * @param  {string} key
     * @return {Table} 
     */
    getTable(key)
    {
        let resultObj = null;

        if (this._tableContainer.hasOwnProperty(key))
        {
            resultObj = this._tableContainer[key];
        }

        return resultObj;
    }

    /**
     * Rewrites a Table objects
     * 
     * @param {string} key 
     * @param {Table}  table 
     */
    updateTable(table)
    {
        this._tableContainer[table.title] = table;
    }

    /**
     * Removes a Table object by key
     * 
     * @return {boolean}
     */
    removeTable(key)
    {
        let result = false;

        if (this._tableContainer.hasOwnProperty(key))
        {
            delete this._tableContainer[key];
            result = true;
        }

        return result;
    }

    /**
     * Returns the api title
     * 
     * @return {string}
     */
    get title()
    {
        return this._name;
    }


    /**
     * Returns the table container as a dictionary
     * 
     * @return {Object}
     */
    get tableMap()
    {
        return this._tableContainer;
    }

    /**
     * Returns the table container as an array
     * 
     * @return {array}
     */
    get tableList()
    {
        const list = []

        for (const key in this._tableContainer)
        {
            list.push (this._tableContainer[key]);
        }

        return list;
    }

    /**
     * Returns the table titles as an array
     * 
     * @return {array}
     */
    get tableTitleList()
    {
        const list = [];

        for (const key in this._tableContainer) 
        {
            list.push(this._tableContainer[key].title);
        }

        return list;
    }
}

export 
{
    Api, 
    Table, 
    Field, 
    Type, 
    Constraint, 
    NotNull, 
    AutoIncrement, 
    Check, 
    PrimaryKey, 
    ForeignKey,
    Reference,
    Action
}