import 
{ 
    deleteChildren,
    newTagClassChild, 
    newTagClassHTML 
} 
from "./elemfactory";

import
{
    EditableTextField,
    EditableNumberField,
    EditableSelectField,
    EditableCheckboxField,
    EditableDummyField,
    EditableMultiField
}
from "./wc";

import
{
    Constraint, ForeignKey, PrimaryKey
}
from "../dbelems/Constraint";

class ConstraintRow extends HTMLTableRowElement
{
    /**
     * 
     * @param  {Contraint} constraint
     * @param  {integer}   index 
     * @param  {object}    options 
     */
    constructor(constraint, index, options, fieldList, pkFlag = false)
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------
        
        this._index         = index;
        this._editable      = options.hasOwnProperty( 'editable' ) ? options.editable : false; 
        this._constraintMap = {};
        this.setAttribute('constraint-row', index);

        // -------------------------------------
        // -
        // -

        let constraintType = 'CHECK';

        if (constraint instanceof Constraint)
        {
            cocnstraintType = constraint.type;
        }

        const typeOptionList = 
        [
            "CHECK",
            "INDEX",
            "UNIQUE",
            "FOREIGN KEY",
        ];

        if ( ! pkFlag) typeOptionList.push('PRIMARY KEY');

        // -----------------------------------------------
        // - Create the event object with:
        // - (1) Event title
        // - (2) Event data, the row index
        // -----------------------------------------------

 

        // ------------------------------------------------
        // - Create an array with field keys as strings
        // -------------------------------------------------

        this._fieldList = fieldList.map(field => field.key);

        this.addEventListener
        (
            "constraint-type", e => 
            {
                deleteChildren(this);

                if (e.detail.value === 'PRIMARY KEY')
                {
                    this.buildPrimaryKey(typeOptionList, index, options);
                }
                else if (e.detail.value === 'FOREIGN KEY')
                {
                    this.buildForeignKey(typeOptionList, index, options);
                }
            },
            true
        );

      
        //this.buildPrimaryKey();
        
        this.buildPrimaryKey(typeOptionList, index, options);
    }

    updateFieldList(fieldList)
    {
        this._fieldList = fieldList.map(field => field.key);
    }

    /**
     * Builds the table divs with the editable field elements
     * And the button that toggles the editmode
     */
    buildPrimaryKey(typeOptionList, index, options)
    {
        const typeEvent = { title: 'constraint-type', index: index };
        //const mockList = ['id', 'name', 'email', 'address'];
        this._constraintMap['type']      = new EditableSelectField(typeOptionList, typeEvent, options, 'PRIMARY KEY');
        this._constraintMap['target']    = new EditableMultiField(this._fieldList, index, options);
        this._constraintMap['reference'] = new EditableDummyField('', index, options);
        this._constraintMap['action']    = new EditableDummyField('', index, options); 

        const 
        button = newTagClassHTML("button", "table__button", "e");
        button.addEventListener("click", e => {
            this.toggleMode();
        });

        this.appendChild(newTagClassChild("td", "constraint__type",          this._constraintMap['type']));
        this.appendChild(newTagClassChild("td", "constraint__target--pk",    this._constraintMap['target']));
        this.appendChild(newTagClassChild("td", "constraint__reference--pk", this._constraintMap['reference']));
        this.appendChild(newTagClassChild("td", "constraint__action--pk",    this._constraintMap['action']));
        this.appendChild(newTagClassChild("td", "constraint__button--edit",  button));

    }

    /**
     * Builds the table divs with the editable field elements
     * And the button that toggles the editmode
     */
    buildForeignKey(typeOptionList, index, options)
    {
        const typeEvent = { title: 'constraint-type', index: index };

        this._constraintMap['type']      = new EditableSelectField(typeOptionList, typeEvent, options, 'PRIMARY KEY');
        this._constraintMap['target']    = new EditableSelectField(this._fieldList, index, options);
        this._constraintMap['reference'] = new EditableSelectField('', index, options);
        this._constraintMap['action']    = new EditableSelectField('', index, options); 

        const 
        button = newTagClassHTML("button", "table__button", "e");
        button.addEventListener("click", e => {
            this.toggleMode();
        });

        this.appendChild(newTagClassChild("td", "constraint__type",          this._constraintMap['type']));
        this.appendChild(newTagClassChild("td", "constraint__target--fk",    this._constraintMap['target']));
        this.appendChild(newTagClassChild("td", "constraint__reference--fk", this._constraintMap['reference']));
        this.appendChild(newTagClassChild("td", "constraint__action--fk",    this._constraintMap['action']));
        this.appendChild(newTagClassChild("td", "constraint__button--edit",  button));

    }



    /**
     * Toggles the row state between:
     * Static mode
     * Edit mode
     */
    toggleMode()
    {
        if (this.editable)
        {
            this.setStaticMode();
        }
        else
        {
            this.setEditMode();
        }

    }

    /**
     * Sets the state to 'Edit Mode'
     */
    setEditMode()
    {
        if ( ! this.editable)
        {
            for (const key in this._constraintMap)
            {
                if (key === 'target')
                {
                    this._constraintMap['target'].setEditMode(this._fieldList);
                }
                else
                {
                    this._constraintMap[key].setEditMode();
                }
            }

            this.editable = true;
            this.emitModeEvent();
        }
    }

    /**
     * Sets the state to 'Static Mode'
     */
    setStaticMode()
    {
        if (this.editable)
        {
            for (const key in this._constraintMap)
            {
                this._constraintMap[key].setStaticMode();
            }

            this.editable = false;
            this.emitCreateConstraintEvent();
        }
    }

    /**
     * This event is dispatched when the mode changes
     * The event delegates:
     * (1) Row number (this.index)
     * (2) Editable state (this.editable)
     */
    emitModeEvent()
    {
        this.dispatchEvent
        (
            new CustomEvent
            (
                "constraint-row-mode", 
                { detail: { index: this.index, mode: this.editable }}
            )
        );
    }

    /**
     * This event is dispatched when the constraint row mode
     * is changed from 'Edit Mode' to 'Static Mode'
     * The event delegates:
     * (1) Row number (this.index)
     * (2) Constraint properties (this.constraint)
     */
    emitCreateConstraintEvent()
    {
        this.dispatchEvent
        (
            new CustomEvent
            (
                "solidify-constraint", 
                { detail: { index: this.index, constraint: this.constraint }}
            )
        );
    }

    /**
     * Row index getter
     */
    get index()
    {
        return this._index;
    }

    /**
     * Editable state getter
     */
    get editable()
    {
        return this._editable;
    }

    /**
     * Editable state setter
     */
    set editable(state)
    {
        if (state) 
        {
            this._editable = true;
        }
        else
        {
            this._editable = false;
        }
    }

    // ---------------------------------------
    // -
    // - The field value getters and setters
    // -
    // ---------------------------------------

    get type()
    {
        return this._constraintMap['type'].content;
    }

    get target()
    {
        return this._constraintMap['target'].content;
    }

    get reference()
    {
        return this._constarintMap['reference'].content;
    }

    get action()
    {
        return this._constraintMap['action'].content;
    }



    get constraint()
    {
        let constraint = null;

        if (this.type === 'PRIMARY KEY')
        {
            constraint = new PrimaryKey(this.table, this.target);
        }
        else if (this.type === 'FOREIGN KEY')
        {
            constraint = new ForeignKey(this.table, this.target, this.reference, this.action);
        }

        return constraint;
    }
}

window.customElements.define('constraint-row', ConstraintRow, { extends: 'tr' });

export { ConstraintRow, Constraint }