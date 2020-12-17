const ACTION_REF = 
{
    "NO ACTION"   : 0,
    "CASCADE"     : 1,
    "SET DEFAULT" : 2,
    "SET NULL"    : 4,
    "RESTRICT"    : 8
};

const actionDict =
{
    0 : "NO ACTION",
    1 : "CASCADE",
    2 : "SET DEFAULT",
    4 : "SET NULL",
    8 : "RESTRICT"
};

class Action
{
    constructor(type)
    {
        this._type = type;
    }

    get ref()
    {
        return ACTION_REF[this.type];
    }

    get type()
    {
        this._type;
    }

    static dict(index)
    {
        return actionDict[index];
    }

    static index(key)
    {
        return ACTION_REF[key];
    }

}

export { Action, ACTION_REF }