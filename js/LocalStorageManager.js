const STORE = {
    User: "user",
    Api:  "api",
    Apilist: "apilist",
    Table: "table",
    TreeState: "tree-state",
}

class Store
{

    static createUser(user)
    {
        console.log("Store::createUser " + user);
        localStorage.setItem(STORE.User, { id: user.id, name: user.name });
    }

    static readUser()
    {
        const user = localStorage.getItem(STORE.User);
        console.log("Store::readUser: " + user);
        return user;
    }

    static createApi(title, api)
    {
        const key = STORE.Api + title;
        const serialized = JSON.stringify(api);
        console.log("Store::createApi key: " + key);
        console.log("Stringified api: " + serialized);
        localStorage.setItem(key, serialized);
    }

    static readApi(title)
    {
        const key = STORE.Api + title;
        const api = localStorage.getItem(key);
        console.log("Store::readApi: " + api);
        if (api !== "undefined")
            return JSON.parse(api);
        else
            return null;
    }

    static createApiList(apiMap)
    {
        console.log("Store::createApiList");
        
        // - Create title list
        for (const key in apiMap)
        {
            const storeKey = STORE.Api + "::" + key;
            const api = apiMap[key];
            console.log("Create list item: " + key);
            localStorage.setItem(storeKey, api);
        }
    }

    static readApiList()
    {
        const list = localStorage.getItem(STORE.Api);
        
        console.log("Store::readApiList");
        if (Array.isArray(list)) for (const item of list)
        {
            console.log("item: " + item);
        }

        return list;
    }


}




export { Store }