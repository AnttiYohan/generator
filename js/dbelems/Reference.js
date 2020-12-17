/**
 * Reference to table:field
 */
class Reference
{
    constructor(table, field)
    {
        this._table = table;
        this._field = field;
    }

    get table()
    {
        return this._table;
    }

    get field()
    {
        return this._field;
    }
}

export { Reference }