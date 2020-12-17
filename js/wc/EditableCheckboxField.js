import { checkboxClass } from "./elemfactory";
import { EditableField } from "./EditableField"

class EditableCheckboxField extends EditableField
{
    /**
     * 
     * @param {string} content 
     * @param {object} options 
     */
    constructor(checked, eventId, options)
    {
        super(checked, eventId, options);    

        this._input    = checkboxClass("table__checkbox", checked);
        
        this.setupInput(this._input);

        this.setContent();
    }


    // ---------------------
    // Extended methods
    // --------------------

    setContent()
    {
        if (this.content)
        {
            super.setContent("true");
            //this._input.checked = true;
        }
        else
        {
            super.setContent("false");
            //this._input.checked = false;
        }
    }

    get content()
    {
       return this._input.checked;
    }    
}

window.customElements.define( 'editable-checkbox-field', EditableCheckboxField );

export { EditableCheckboxField }