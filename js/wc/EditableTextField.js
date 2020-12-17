import { inputClassName } from "./elemfactory";
import { EditableField } from "./EditableField"
 
class EditableTextField extends EditableField
{
    /**
     * 
     * @param {string} title 
     * @param {object} dimensions 
     */
    constructor(content, eventId, options)
    {
        super(content, eventId, options);

        this._input = inputClassName("editable");
        
        this.setupInput(this._input);

        if (content.length)
        {
            this.setInitialContent(content);
        }
    }

    // ---------------------
    // Extended methods
    // --------------------

    setInitialContent(content)
    {
        super.setContent(content);
        this._input.value = content;
    }


    get content()
    {
       return this._input.value;
    }    
}

window.customElements.define( 'editable-text-field', EditableTextField );

export { EditableTextField }