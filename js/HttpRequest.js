/**
 * Fetch API Wrapper
 * Implements GET, POST, PUT, DELETE
 */
class HttpRequest
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
     * @return {Promise} 
     */
    async get(url)
    {
        const response = await fetch
        (url, {
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
    async post(url, data)
    {
        const response = await fetch
        (url, {
                method: "POST",
                mode:    this.mode, 
                headers: this.headers,
                body: JSON.stringify(data)
        });

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
    async put(url, data)
    {
        const response = await fetch
        (url, {
                method: "PUT",
                mode:    this.mode, 
                headers: this.headers,
                body: JSON.stringify(data)
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
}

export { HttpRequest }