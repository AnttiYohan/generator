import { numberInputMinMaxDefault } from "./elemfactory";
import { EditableField } from "./EditableField"

class EditableNumberField extends EditableField
{
    /**
     * 
     * @param {string} content 
     * @param {object} options 
     */
    constructor(value, eventId, options)
    {
        super(value, eventId, options);

        const min      = options.hasOwnProperty('min')      ? options.min      : 0;
        const max      = options.hasOwnProperty('min')      ? options.min      : 8192;
        const initial  = value;       

        this._input    = numberInputMinMaxDefault(min, max, value);
        
        this.setupInput(this._input);

        this.setInitialContent();
    }

    // ---------------------
    // Extended methods
    // --------------------

    setInitialContent()
    {
        super.setContent(this.content);
    }

    get content()
    {
       return this._input.value;
    }    
}

window.customElements.define( 'editable-number-field', EditableNumberField );

export { EditableNumberField }