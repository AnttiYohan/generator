import { EditableField } from "./EditableField"
 
class EditableDummyField extends EditableField
{
    /**
     * 
     * @param {string} title 
     * @param {object} dimensions 
     */
    constructor(content, event, options)
    {
        super('', event.index, options);
    }



    get content()
    {
       return '';
    }    
}

window.customElements.define( 'editable-dummy-field', EditableDummyField );

export { EditableDummyField }