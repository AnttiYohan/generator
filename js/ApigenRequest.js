/**
 * Request Handler for apigen.tech that
 * Handles requests and populates user and api objects
 * Implements GET, POST, PUT, DELETE
 */
class ApigenRequest
{
    /**
     * Sets the Request options and
     * Creates a Headers object
     * @param {dictionary} headerOptions 
     */
    constructor(headerOptions)
    {
        this.mode    = "cors";
        this.headers = new Headers({
            "Accept" : "application/json",
            "Content-type" : "appication/json"
        });
    }

    /**
     * Invokes aFETCH APIs HTTPGET Request
     * returns a promise to from Response.json
     * 
     * @param  {string}  url
     * @return {Promise} response.json() 
     */
    async getAllUsers()
    {
        const response =
        await fetch("http://apigen.local/user",
        {
                method: "GET",
                mode:    this.mode, 
                //headers: this.headers
        });

        return response.json();
    }

    /**
     * Requests user by id
     * 
     * @param  {number}  id
     * @return {Promise} 
     */
    async getUserById(id)
    {
        const response = 
        await fetch(`http://apigen.local/user/${id}`, 
        {
                method: "GET",
                mode:    this.mode, 
                //headers: this.headers
        });

        return response.json();
    }    

    /**
     * Requests all APIs identified by user_id 
     * returns a promise to from Response.json
     * 
     * @param  {number}  id
     * @return {Promise} response.json() 
     */
    async getAllApisByAuthor(id)
    {
        const response =
        await fetch(`http://apigen.local/api/${id}`,
        {
                method: "GET",
                mode:    this.mode, 
                //headers: this.headers
        });

        return response.json();
    }

    /**
     * Requests API identified by user_id and api title 
     * returns a promise to from Response.json
     * 
     * @param  {number}  id
     * @return {Promise} response.json() 
     */
    async getApiByAuthorTitle(id, title)
    {
        const response =
        await fetch(`http://apigen.local/api/${id}/${title}`,
        {
                method: "GET",
                mode:    this.mode, 
                //headers: this.headers
        });

        return response.json();
    }

    /**
     * Invokes FETCH APIs HTTP POST Request
     * returns a promise to from Response.json
     * 
     * @param  {string}  url
     * @param  {object}  data
     * @return {Promise} Response.json()
     */    
    async postApiByAuthor(id, data)
    {
        const response = await fetch
        (
            `http://apigen.local/api/${id}`, 
            {
                method: "POST",
                mode:    this.mode, 
                //headers: this.headers,
                body: ApigenRequest.serializeApi(data)
            }
        );

        return response.json();        
    }

    /**
     * Post an API Schema into Apigen
     * @param {string} title 
     * @param {Api}    api 
     */
    async postSchema(title, api)
    {
        const response = await fetch
        (
            `https://apigen.local/schema/${title}`,
            {
                method: "POST",
                mode:   this.mode,
                body:   ApigenRequest.serializeApi(api)
            }
        );

        return await response.json();
    }

    async postMultipartContent(api, fd)
    {
        const response = await fetch
        (
            `http://apigen.local/content/${api}`,
            {
                method: "POST",
                mode:   this.mode,
                body:   fd
            }
        )
    }

    async login(auth)
    {
        const response = await fetch
        (
            "https://apigen.local/login",
            {
                method: "POST",
                mode: this.mode,
                body: JSON.stringify(auth)
            }
        );

        return response.json();
    }
    /**
     * Invokes FETCH APIs HTTP PUT Request
     * returns a promise to from Response.json
     * 
     * @param  {string}  url
     * @param  {object}  data
     * @return {Promise} Response.json()
     */     
    async putApi(data)
    {
        const response = await fetch
        (url, {
                method: "PUT",
                mode:    this.mode, 
                headers: this.headers,
                body: ApigenRequest.serializeApi(data)
        });

        return response.json();        
    }

    /**
     * Invokes FETCH APIs HTTP DELETE Request
     * returns a promise to from Response.json
     * 
     * @param  {string}  url
     * @return {Promise} Response.json()
     */     
    async delete(url)
    {
        const response = await fetch
        (url, {
                method: "DELETE",
                mode:    this.mode, 
                headers: this.headers
        });

        return response.json();        
    }

    /**
     * Creates proper serialized data from an Api object
     * for the Apigen service
     * 
     * @param  {Api}    api 
     * @return {string} serialized Api data
     */
    static serializeApi(api)
    {
        const apiObj = {
            _name       : api.title,
            _tableList  : [],
            _modelList  : []
        };

        for (const table of api.tableList)
        {
            apiObj._tableList.push
            ({
                    _name           : table.title,
                    _fieldList      : table.fieldArray(),
                    _constraintList : table.constraintList
            });
        }
        
        return JSON.stringify(apiObj);
    }
}

export { ApigenRequest }