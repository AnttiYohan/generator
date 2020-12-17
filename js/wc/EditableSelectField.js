import { selectClassIdOptionList } from "./elemfactory";
import { EditableField } from "./EditableField"

class EditableSelectField extends EditableField
{
    /**
     * 
     * @param {string} content 
     * @param {object} options 
     */
    constructor(optionList, event, options, selection = '')
    {
        super('', event.index, options);

        this._input = selectClassIdOptionList
        (
            "table__select",
            null,
            optionList          
        );

        this._input.addEventListener("change", e =>
        {
            this.setContent(e.target.value);
            this.dispatchEvent(new CustomEvent(event.title, {detail: {index: event.index, value: e.target.value}}));
        });
        
        this.setupInput(this._input);

        // ----------------------------------------------------------------
        // - Check if 'selection' is a valid option in the SELECT element
        // - If it is, assign the 'selection' as the selected index
        // ---------------------------------------------------------------- 
        if (optionList.includes(selection))
        {
            this._input.value = selection;
            this.setInitialContent();
        }
    }

    setInitialContent()
    {
        super.setContent(this.content);
    }
    // ---------------------
    // Extended methods
    // --------------------

    /**
     * Returns the selected index text content
     * 
     * @return {string}
     */
    get content()
    {
        let result = '';

        if (this._input && this._input.length)
        {
            const index = this._input.selectedIndex;
            result = this._input.options[index].innerHTML;
        }

        return result;
    }    
}

window.customElements.define( 'editable-select-field', EditableSelectField );

export { EditableSelectField }