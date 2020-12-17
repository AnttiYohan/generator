<?php


/**
 * This class models the structure of an API which
 * Has: 
 * - Database (Tables, Fields)
 * - Models (Queries to these Tables)
 */
class Api
{
    public $id          = 0;
    public $name        = "";
    public $table_list  = [];

    public function __construct($id = "", $name = "", $tables = NULL)
    {
        if (!empty($id) && !empty($name))
            $this->create($id, $name, $tables);
    }

    public function title()
    {
        return $this->name;
    }

    public function add_table($table)
    {
        if ($table instanceof Table)
            $this->table_list[] = $table;
    }

    public function load_tables($tables)
    {
        $this->table_list = [];

        foreach($tables as $table) $this->add_table($table);
    }

    public function get_table_list()
    {
        return $this->table_list;
    }

    public function create($id, $name, $tables = [])
    {
        $this->id   = $id;
        $this->name = $name;
        if (is_array($tables))
            $this->load_tables($tables);
    }

    /**
     * Generates the entire API model from a json string
     * 
     * @param  string  $json
     */
    public function load_from_json($json)
    {
        $data = json_decode($json, TRUE);

        if (array_key_exists('_name', $data))
        {
            $name = $data['_name'];
            print PHP_EOL . "json name: $name" . PHP_EOL; 

            $table_list = [];

            // - Create tables
            foreach($data['_tableList'] as $table)
            {
                $table_list[] = Table::create_from_array($table, $name);
            }

            // - Populate the Api structure
            $this->create("1", $name, $table_list);
        }
    }

    /**
     * Formats table data to DML SELECT prepared statement
     * 
     * @return {string} statement
     */
    public function select_stmt($assoc = FALSE)
    {
        $WHERE = "WHERE user_id=? AND name=?";
        
        if ($assoc)  $WHERE = "WHERE user_id=:user_id AND name=:name";
        
        return "SELECT * FROM Apis $WHERE";
    }

    /**
     * Formats table data to DML INSERT INTO prepared statement
     * 
     * @return {string} statement
     */
    public function insert_stmt()
    {
        return "INSERT INTO Apis (`name`, `user_id`) VALUES(?, ?)";
    }

    public function out()
    {
        print PHP_EOL . 
        "API name: " . $this->name . PHP_EOL;

        if (empty($this->table_list)) print "No tables." . PHP_EOL;
        else
        {
            print "Tables: ";
            foreach($this->table_list as $table) $table->out();
            print PHP_EOL;
        }
    }    
}

/**
 * Holds the data of a Relational Database Table
 */
class Table 
{
    // -----------------------------------------
    // - Properties
    // -----------------------------------------

    public $parent          = "";
    public $name            = "";
    public $field_list      = [];
    public $constraint_list = [];    


    // -----------------------------------------
    // - Methods
    // -----------------------------------------

    /**
     * Class constructor with parameters:
     * 
     * @param  {string}  $name
     * @param  {array}   $field_list
     * @param  {array}   $constrait_list
     */
    public function __construct($name, $field_list = NULL, $constraint_list = NULL, $parent = "")
    {
        $this->name   = $name;
        $this->parent = $parent;
        $this->load_fields($field_list);
        $this->load_constraints($constraint_list);
    }

    /**
     * Checks wheter Table has a field
     * 
     * @param  {string}  $key
     * @return {boolean}
     */
    public function has_field($key)
    {
        return array_key_exists($key, $this->field_list);
    }

    /**
     * Adds a field in the Table object
     * 
     * @param {Field} $field
     */
    public function add_field($field)
    {
        if ($field instanceof Field)
        {
            $this->field_list[] = $field;
        }
    }

    /**
     * Adds a constraint in the Table object
     * 
     * @param {Constraint} $constraint
     */
    public function add_constraint($constraint)
    {
        if ($constraint instanceof Constraint)
        {
            $this->constraint_list[] = $constraint;
        }
    }

    /**
     * Loads fields into the table
     * 
     * @param array $field_list
     */
    public function load_fields($field_list)
    {
        $this->field_list = [];
        foreach($field_list as $field)
            $this->add_field($field);
    }

    /**
     * Loads constraints into the table
     * 
     * @param array $constraint_list
     */
    public function load_constraints($constraint_list)
    {
        $this->constraint_list = [];
        foreach($constraint_list as $constraint)
            $this->add_constraint($constraint);
    }

    public function out()
    {
        print PHP_EOL . 
        "Table name: " . $this->name . PHP_EOL;

        if (empty($this->field_list)) print "No fields." . PHP_EOL;
        else
        {
            print "Fields: ";
            foreach($this->field_list as $field) $field->out();
            print PHP_EOL;
        }


        if (empty($this->constraint_list)) print "No table constraints." . PHP_EOL;
        else
        {
            print "Table Constraint count " . count($this->constraint_list);
            foreach($this->constraint_list as $constraint) $constraint->out();
            print PHP_EOL;
        }
    }

    public function title()
    {
        return $this->name;
    }

    /**
     * Creates a new Table instance from json decoded array
     * 
     * @param  {array}  $data
     * @return {Table}
     */    
    public static function create_from_array($data, $parent)
    {
        if ( ! isset($data['_name']))
        {
            return null;
        }

        $name            = $data['_name'];
        $field_list      = [];
        $constraint_list = [];

        if (is_array($data['_fieldList'])) foreach($data['_fieldList'] as $field)
        {
            $field_list[$field['_key']] = Field::create_from_array($field, $name);
        }

        if ( is_array( $data['_constraintList'] ) ) foreach( $data['_constraintList'] as $constraint )
        {    

            if ($constraint['_type'] == Constraint::PRIMARY_KEY)
            {
                $constraint_list[] = PrimaryKey::create_from_array($constraint);
            }
            elseif ($constraint['_type'] == Constraint::FOREIGN_KEY)
            {
                $constraint_list[] = ForeignKey::create_from_array($constraint);
            }                        
            else
            {
                $constraint_list[] = Constraint::create_from_array($constraint);
            } 
                
        }

        // - Return a new Table instance
        return new Table($name, $field_list, $constraint_list, $parent);
    }

    /**
     * Outputs table data in DDL fmt
     * 
     * @return {string} ddl
     */
    public function ddl()
    {
        $ddl = "CREATE TABLE $this->name (" . PHP_EOL;

        foreach ($this->field_list as $field)
        {
            $ddl .= "    " . $field->ddl() . "," . PHP_EOL;
        }

        $length = count($this->constraint_list);

        for ($i = 0; $i < $length; $i++)
        {
            //$delim = PHP_EOL;
            //if ($i + 1 < $length) 
            $delim = ($i + 1) < $length ? "," . PHP_EOL : PHP_EOL;
    
            $ddl .= "    " . $this->constraint_list[$i]->table_constraint_ddl($this->name, $delim);
        }

        return $ddl . ");" . PHP_EOL;
    }

    /**
     * Formats table data to DML SELECT prepared statement
     * 
     * @return {string} statement
     */
    public function select_stmt( $assoc = false ) 
    {
        $args = [ 'name', 'api_id' ];
        
        return "SELECT * FROM Tables" . set_where_args( $args, $assoc );
    }

    /**
     * Formats table data to DML INSERT INTO prepared statement
     * 
     * @param  array  $values
     * @return string statement
     */
    public function insert_stmt( $values = [] )
    {
        return [
        
            'stmt'   => "INSERT INTO Tables (`name`, `api_id`) VALUES (?, ?)",
            'values' => $values

        ];
    }

}

/**
 * Models a Relational Database table field
 */
class Field 
{
    // -----------------------------------------
    // - Properties
    // -----------------------------------------

    public $parent          = "";
    public $name            = "";
    public $type            = "";
    public $size            = 0;
    public $notnull         = false; 
    public $default_value   = null;
    public $autoinc         = 0;
    public $constraint_list = [];

    // -----------------------------------------
    // - Methods
    // -----------------------------------------

    /**
     * Class constructor
     * 
     * @param  string  $name
     * @param  Type    $type
     * @param  integer $size
     * @param  boolean $notnull
     * @param  string  $default_value
     * @param  integer $autoinc
     * @param  string  $parent 
     */
    public function __construct( $name, $type, $size = 0, $notnull = false, $default_value = null, $autoinc = 0, $parent = "" )
    {

        $this->name          = $name;
        $this->type          = $type;
        $this->size          = $size;
        $this->notnull       = $notnull;
        $this->default_value = $default_value;
        $this->autoinc       = $autoinc;
        $this->parent        = $parent;

    }
    // ----------------------------------
    // - Getters
    // ----------------------------------

    public function title()
    {
        return $this->name;
    }

    public function type()
    {
        return $this->type;
    }

    public function size()
    {
        return $this->size;
    }

    public function notnull()
    {
        $result = 0;

        if ( $this->notnull ) $result = 1;

        return $result;
    }

    public function default_value()
    {
        return $this->default_value;
    }

    public function autoinc()
    {
        return $this->autoinc;
    }

    /** 
     * Returns the string representation of the field object
     * 
     * @param  string $delim
     * @return string
     */
    public function to_string( $delim = " " )
    {
        return

        $this->title()         . $delim . 
        $this->type()          . $delim .
        $this->size()          . $delim .
        $this->notnull()       . $delim .
        $this->default_value() . $delim . 
        $this->autoinc(); 

    }

    /**
     * Returns the values array of insert stmt
     * 
     * @param  integer $table_id
     * @param  boolean $assoc
     * @return string
     */
    public function values( $table_id, $assoc = false )
    {

        if ( $assoc ) {

            return [

                'key'           => $this->title(),
                'type'          => $this->type(),
                'size'          => $this->size(),
                'table_id'      => $table_id,
                'notnull'       => $this->notnull(),
                'default_value' => $this->default_value(),
                'autoinc'       => $this->autoinc()

            ];

        }

        return [

            $this->title(),
            $this->type(),
            $this->size(),
            $table_id,
            $this->default_value(),
            $this->notnull(),
            $this->autoinc()

        ];

    }

    /**
     * Create a Field instance from an array
     * 
     * @param  array  $data
     * @return Field object
     */
    public static function create_from_array( $data )
    {
        if ( ! isset($data[ '_key' ]) || ! isset($data[ '_type' ]))
        {
            return null;
        }

        $field_name          = $data['_key'];
        $field_type          = $data['_type'];
        $field_size          = isset( $data['_size'] )         ? $data['_size']         : 0;
        $field_notnull       = isset( $data['_notnull'] )      ? $data['_notnull']      : false;
        $field_default_value = isset( $data['_defaultValue'] ) ? $data['_defaultValue'] : null;
        $field_autoinc       = isset( $data['_autoinc'] )      ? $data['_autoinc']      : 0;
        $field_parent        = isset( $data['_parent'] )       ? $data['_parent']       : '';

        return new Field
        (
            $field_name, 
            $field_type, 
            $field_size, 
            $field_notnull,
            $field_default_value,
            $field_autoinc,
            $field_parent
        );
    }

    /**
     * Formats Field in a Data Definiton Language format
     * 
     * @param  string  $delim
     * @return string
     */
    public function ddl($delim = "")
    {
        $result  = $this->title() . ' ' . $this->type() .
                   $this->size() > 0 ? '(' . $this->size() . ')' : '' .
                   $this->notnull() ? ' NOT NULL' : '';
        
        $autoinc = $this->autoinc();

        if ( $autoinc )
        {
            $result .= ' AUTO_INCREMENT';
            if ( $autoinc > 1 ) $result .= "=$autoinc";
        }

        return $result . $delim;
    }
    
    /**
     * Formats Field object into a prepared SELECT statement
     * 
     * @param  boolean $assoc  
     * @return string  statement
     */
    public function select_stmt( $assoc = false, $where_args = [] )
    {       
        return "SELECT * FROM Fields" . set_where_args( $assoc, $where_args );
    }

    /**
     * Formats Field data to DML INSERT INTO prepared statement
     * 
     * @param  array  $values
     * @return string statement
     */
    public function insert_stmt( $values = [] )
    {
        return [
        
            'stmt'   => "INSERT INTO Fields (`name`, `type`, `size`, `table_id`, `defaultval`, `notnull`, `autoinc`) VALUES (?, ?, ?, ?, ?, ?, ?)",
            'values' => $values
    
        ];
    }

}

/**
 * Formats list of arguments into a prepared WHERE clause
 * $assoc is a flag that determinaes wheter a associated array
 * should be used when passing the values into the statement
 * 
 * @param  array   $args The fields to the WHERE clause
 * @param  boolean $assoc
 * @return string  where clause
 */
function set_where_args( $args, $assoc = false )
{
    if ( empty( $args ) ) return "";

    $result = " WHERE ";
    $c = 0;
    foreach ( $args as $arg )
    {
        if ( $c ) $result .= " AND ";
        $c = 1;

        $result .= "$arg = ";
        $result .= $assoc ? ":$arg" : "?";
    }

    return $result;
}

/**
 * Helper function to obtain all class constant names
 * 
 * @param  {Class context}
 * @return {array}
 */
function const_names($ctx)
{
    $cls = new ReflectionClass($ctx);
    return array_flip($cls->getConstants());
}

/**
 * Helper function to obtain a single class constant name
 * 
 * @param  {Class context}
 * @param  {index}
 * @return {string}
 */
function const_name($ctx, $value)
{
    return array_flip((new ReflectionClass($ctx))->getConstants())[$value];    
}


/**
 * Relational databse constraint model
 */
class Constraint
{
    /*public const NONE           = 0;
    public const CHECK          = 1;    
    public const INDEX          = 2;
    public const UNIQUE         = 4;
    public const DEFAULT        = 8;    
    public const NOT_NULL       = 16;  
    public const PRIMARY_KEY    = 32;
    public const FOREIGN_KEY    = 64;
    public const AUTO_INCREMENT = 128;*/
    public const NONE           = "NONE";
    public const CHECK          = "CHECK";    
    public const INDEX          = "INDEX";
    public const UNIQUE         = "UNIQUE";
    public const DEFAULT        = "DEFAULT";    
    public const NOT_NULL       = "NOT NULL";  
    public const PRIMARY_KEY    = "PRIMARY KEY";
    public const FOREIGN_KEY    = "FOREIGN KEY";
    public const AUTO_INCREMENT = "AUTO_INCREMENT";

    public $table_id     = 0;
    public $type         = self::NONE;    
    public $target_table = "";
    public $target_field = "";
    public $action       = "NULL";   

    public function __construct( $type, $table_id, $target_field, $action = "NULL" )
    {
        $this->type         = $type;
        $this->table_id     = $table_id;
        $this->target_field = $target_field;
        $this->action       = $action;
    }

    public static function is_key($key)
    {
        return array_key_exists($key, (new ReflectionClass(__CLASS__))->getConstants());
    }

    public function out()
    {
        $constraint = const_names(__CLASS__);
        print
        PHP_EOL . "Constraint " . $constraint[$this->type] . 
        " targets: " . $this->target_table . "::" . $this->target_field;
    }

    public static function create_from_array($data)
    {
        $type         = $data['_type'];
        $target_table = $data['_targetTable'];
        $target_field = $data['_targetField'];

        $cls = new ReflectionClass(__CLASS__);
        $const_list = $cls->getConstants();
        return new Constraint($const_list[$type], $target_table, $target_field);
    }

    public function table_id()
    {
        return $this->table_id;
    }

    public function target_field()
    {
        return $this->target_field;
    }

    public function title()
    {
        return (const_names(__CLASS__))[$this->type];
    }

    public function action()
    {
        return $this->action;
    }

    public function to_array()
    {
        return [
            'table_id'     => $this->table_id,
            'target_field' => $this->target_field,
            'type'         => $this->type,
            'action'       => $this->action
        ];
    }

    /**
     * Outputs Constraint data in table constraint DDL fmt
     */
    public function table_constraint_ddl( $table, $delim = "" )
    {
        return "";
    } 
    
    /**
     * Formats Constraint data to DML SELECT prepared statement
     * 
     * @return {string} statement
     */
    public function select_stmt($assoc = FALSE)
    {
        $WHERE = "WHERE table_id = ? AND type = ?";
        
        if ($assoc)  $WHERE = "WHERE table_id=:table_id AND type=:type";
        
        return "SELECT * FROM Constraints $WHERE";
    }

    /**
     * Formats Field data to DML INSERT INTO prepared statement
     * 
     * @return {string} statement
     */
    public function insert_stmt()
    {
        return "INSERT INTO Constraints (`table_id`, `target_field`, `type`, `action`) 
        VALUES (?, ?, ?, ?)";
    }
}

/**
 * Models SQL NOT_NULL constraint
 */
class NotNull extends Constraint
{
    /**
     * Class constructor
     * 
     * @param {string}  $target_table
     * @param {string}  $target_field
     */
    public function __construct($target_table, $target_field)
    {
        parent::__construct(Constraint::NOT_NULL, $target_table, $target_field);
    }


    /**
     * Returns the properties in array
     * 
     * @return {array}
     */
    public function to_array()
    {
        return [
            'target_table' => $this->target_table,
            'target_field' => $this->target_field,
            'type'         => $this->type,
        ];        
    }

    public static function create_from_array($data)
    {
        $target_table = $data['_targetTable'];
        $target_field = $data['_targetField'];

        return new NotNull($target_table, $target_field);
    }

    /**
     * Formats Field data to DML INSERT INTO prepared statement
     * 
     * @return {string} statement
     */
    public function insert_stmt()
    {
        return "INSERT INTO Constraints (`table_id`, `type`, `target_table`, `target_field`) 
        VALUES (?, ?, ?, ?)";
    }

    /**
     * Debug prints object properties
     */
    public function out()
    {
        print PHP_EOL . "NOT_NULL targets: " . $this->target_table . "::" . $this->target_field;
    }    
}


/**
 * Models SQL AUTO_INCREMENT constraint
 */
class AutoIncrement extends Constraint
{
    /**
     * Class constructor
     * 
     * @param {string}  $target_table
     * @param {string}  $target_field
     * @param {integer} $step
     */
    public function __construct($target_table, $target_field, $step)
    {
        parent::__construct(Constraint::AUTO_INCREMENT, $target_table, $target_field, $step);
    }

    /**
     * Step property getter (wrapper for base class 'action')
     */
    public function step()
    {
        return $this->action;
    }

    /**
     * Returns the properties in array
     * 
     * @return {array}
     */
    public function to_array()
    {
        return [
            'target_table' => $this->target_table,
            'target_field' => $this->target_field,
            'type'         => $this->type,
            'action'       => $this->action
        ];        
    }

    public static function create_from_array($data)
    {
        $type         = $data['_type'];
        $target_table = $data['_targetTable'];
        $target_field = $data['_targetField'];

        $step = 1;

        if (isset($data['_step'])) $step = $data['_step'];

        return new AutoIncrement($target_table, $target_field, $step);
    }

    /**
     * Formats Field data to DML INSERT INTO prepared statement
     * 
     * @return {string} statement
     */
    public function insert_stmt()
    {
        return "INSERT INTO Constraints (`table_id`, `type`, `target_table`, `target_field`, `action`) 
        VALUES (?, ?, ?, ?, ?)";
    }

    /**
     * Debug prints object properties
     */
    public function out()
    {
        print
        PHP_EOL . "AUTO_INCREMENT (" . $this->step() . ")" . 
        " targets: " . $this->target_table . "::" . $this->target_field;
    }    
}

/**
 * CHECK data model
 */
class Check extends Constraint
{
    public $name = "";

    /**
     * Class constructor
     * 
     * @param {string}  $target_table
     * @param {string}  $target_field
     * @param {string}  $condition
     */
    public function __construct( $table_id, $target_field, $expression, $name = "" )
    {
        parent::__construct(Constraint::CHECK, $table_id, $target_field, $expression );
        $this->name = $name;
    }

    /**
     * Condition property getter (wrapper for base class 'action')
     * 
     * @return {string}
     */
    public function expression()
    {
        return $this->action;
    }

    /**
     * Returns the properties in an array
     * 
     * @return {array}
     */
    public function to_array()
    {
        return [
            'table_id'     => $this->api_id,
            'target_field' => $this->target_field,
            'expression'   => $this->action,
            'name'         => $this->name
        ];        
    }

    /**
     * Debug prints object properties
     */
    public function out()
    {
        print
        PHP_EOL . "CHECK (" . $this->condition() . ")" . 
        " targets: " . $this->target_table . "::" . $this->target_field;
    }   
    
    /**
     * Outputs Constraint data in table constraint DDL fmt
     * 
     * @param  {string} $table
     * @param  {string} $delim
     * @return {string}
     */
    public function table_constraint_ddl( $table, $delim = "" )
    {
        return "CHECK $this->target_field( $this->condition )";
    } 
    
    /**
     * Formats Constraint data to DML SELECT prepared statement
     * 
     * @param  {bool}   $assoc
     * @return {string} statement
     */
    public function select_stmt( $assoc = true, $where_args = [] )
    {
        $WHERE = "WHERE table_id = ? AND target_field = ?";
        
        if ( $assoc ) $WHERE = "WHERE table_id=:table_id AND target_field=:target_field";
        
        return "SELECT * FROM Checks $WHERE";
    }

    /**
     * Formats Field data to DML INSERT INTO prepared statement
     * 
     * @return {string} statement
     */
    public function insert_stmt( $values = [] )
    {

        return [

            'stmt'   => "INSERT INTO Checks (`table_id`, `target_field`, `expression`, `name` ) VALUES (?, ?, ?, ?)",
            'values' => $values

        ];

    }    
}

/**
 * INDEX data model
 */
class Index extends Constraint
{
    // --------------------------------------------
    // Member properties:
    // $target_field_list - array of indexed fields
    // $name              - index name
    // --------------------------------------------
    public $target_field_list = [];
    public $name = "";

    /**
     * Index constructor
     * 
     * @param  integer $table_id
     * @param  array   $target_field_list
     * @param  string  $name
     */
    public function __construct( $table_id, $target_field_list, $name = "" )
    {
        parent::__construct( Constraint::INDEX, $table_id, "" );

        $this->target_field_list = $target_field_list;
        $this->name              = $name;
    }

    /**
     * Return the Index members in an array
     * 
     * @return array
     */
    public function to_array()
    {

        return [

            'table_id'          => $this->target_table,
            'target_field_list' => $this->target_field_list,
            'name'              => $this->name

        ];  

    }

    /**
     * Creates an Index object from an array
     * 
     * @param  {array} $data
     * @return {Index}
     */
    public static function create_from_array( $data )
    {
        $table_id          = isset( $data['_tableId'] ) ? $data[ '_tableId' ] : 0;
        $target_field_list = $data['_fieldList'];

        return new Index( $table_id, $target_field_list ) ;
    }

    /**
     * Debug prints object properties
     */
    public function out()
    {
        $field_list_string = "";

        foreach ($this->target_field_list as $item)
        {
            $field_list_string .= $item . " ";
        }

        print PHP_EOL . "INDEX targets: " . $this->target_table . "::" . $field_list_string;
    }

    /**
     * Formats the Index data in a create table data definition statement
     * 
     * @param  {string} $table
     * @param  {string} $delim
     * @return {string}
     */
    public function table_constraint_ddl( $table, $delim = "" )
    {
        $field_string = "";
        $c = 0;

        foreach ( $this->target_field_list as $field ) 
        {
            if ( $c ) $field_string .= ", ";
            $field_string .= $field;
            $c = 1;
        }

        $ddl = "INDEX ($field_string)$delim";

        if ( count( $this->target_field_list ) > 1 )
        {
            $ddl = "CONSTRAINT Idx_$table $ddl"; 
        }

        return $ddl; 
    }
    
    /**
     * Formats Index data a prepared SELECT statement
     * 
     * @param  bool   $assoc
     * @return string statement
     */
    public function select_stmt( $assoc = false )
    {
        $WHERE = "WHERE table_id = ? AND target_field = ?";
        
        if ( $assoc ) $WHERE = "WHERE table_id=:table_id AND target_field=:target_field";
        
        return "SELECT * FROM Indices $WHERE";
    }

    /**
     * Formats PrimaryKey data to DML INSERT INTO prepared statement
     * 
     * @param  array  $values for preparation
     * @return string statement
     */
    public function insert_stmt( $values = [] )
    {
        return [ 
        
            'stmt'   => "INSERT INTO Indices (`table_id`, `target_field`, `name`) VALUES (?, ?, ?)",
            'values' => $values

        ];
    }        
}

/**
 * PRIMARY KEY modeling class
 */
class PrimaryKey extends Constraint
{
    // --------------------------------------------
    // - Properties:
    // - $target_field_list - array of key fields
    // --------------------------------------------

    public $target_field_list = [];

    /**
     * Default constructor
     * 
     * @param  integer $table_id
     * @param  array   $target_field_list
     */
    public function __construct( $table_id, $target_field_list )
    {

        parent::__construct( Constraint::PRIMARY_KEY, $table_id, "" );
        $this->target_field_list = $target_field_list; 

    }

    /**
     * Returns an array of class members
     * 
     * @return array
     */
    public function to_array()
    {
        return [

            'table_id'          => $this->table_id,
            'target_field_list' => $this->target_field_list

        ];        
    }

    /**
     * Creates an PrimaryKey instance from a specific data structure
     * 
     * @param  array        $data
     * @return PrimaryKey
     */
    public static function create_from_array( $data )
    {
        $table_id          = isset( $data[ '_tableId' ] ) ? $data[ '_tableId' ] : 0;
        $target_field_list = $data['_fieldList'];

        return new PrimaryKey( $table_id, $target_field_list );
    }

    /**
     * Debug prints object properties
     */
    public function out()
    {
        $field_list_string = "";

        foreach ($this->target_field_list as $item)
        {
            $field_list_string .= $item . " ";
        }

        print PHP_EOL . "PRIMARY KEY targets: " . $this->target_table . "::" . $field_list_string;
    }

    /**
     * Outputs Primary Key data in table constraint DDL fmt
     */
    public function table_constraint_ddl($table, $delim = "")
    {
        $field_string = "";
        $c = 0;

        foreach ($this->target_field_list as $field)
        {
            if ($c) $field_string .= ", ";
            $field_string .= $field;
            $c = 1;
        }

        $ddl = "PRIMARY KEY ($field_string)$delim";

        if (count($this->target_field_list) > 1)
        {
            $ddl = "CONSTRAINT PK_$table $ddl"; 
        }

        return $ddl; 
    }
    
    /**
     * Formats PrimaryKey data to DML SELECT prepared statement
     * 
     * @return {string} statement
     */
    public function select_stmt( $assoc = false )
    {
        $where = "WHERE table_id = ? AND target_field = ?";
        
        if ( $assoc ) $where = "WHERE table_id=:table_id AND target_field=:target_field";
        
        return "SELECT * FROM PrimaryKeys $where";
    }

    /**
     * Formats PrimaryKey data into preparent INSERT statement
     * 
     * @param  array  $values
     * @return array  statement and values
     */
    public function insert_stmt( $values = [] )
    {
        return [
        
            'stmt'   => "INSERT INTO PrimaryKeys (`table_id`, `target_field`) VALUES (?, ?)",
            'values' => $values

        ];
    }        
}

/**
 * FOREIGN KEY data model
 */
class ForeignKey extends Constraint
{
    // --------------------------------------------
    // Member properties:
    // $reference_table  - name of the referenced table
    // $reference_field  - name of the referenced field
    // $on_update        - update action
    // $on_delete        - delete action
    // --------------------------------------------

    public $reference_table;
    public $reference_field;
    public $on_update;
    public $on_delete;

    /**
     * ForeignKey constructor
     * 
     * @param  integer $table_id
     * @param  string  $target_field
     * @param  string  $ref_table
     * @param  string  $ref_field
     * @param  string  $update_action
     * @param  string  $delete_action
     */
    public function __construct( $table_id, $target_field, $ref_table, $ref_field, $update_action, $delete_action )
    {
        parent::__construct( Constraint::FOREIGN_KEY, $table_id, $target_field );

        $this->reference_table = $ref_table;
        $this->reference_field = $ref_field;
        $this->on_update = $update_action;
        $this->on_delete = $delete_action;
    }

    /**
     * Return mamber properties in an array
     */
    public function to_array()
    {
        return [

            'table_id'        => $this->table_id,
            'target_field'    => $this->target_field,
            'reference_table' => $this->reference_table,
            'reference_field' => $this->reference_field,
            'on_update'       => $this->on_update,
            'on_delete'       => $this->on_delete

        ];        
    }

    /**
     * Creates ForeignKey object from a specific data structure
     * 
     * @param  array        $data
     * @return ForeignKey
     */
    public static function create_from_array($data)
    {
        $table_id        = isset( $data[ '_tableId' ] ) ? $data[ '_tableId' ] : 0;
        $target_field    = $data['_targetField'];
        $reference_table = $data['_referenceTable'];
        $reference_field = $data['_referenceField'];
        $on_update       = $data['_onUpdate'];
        $on_delete       = $data['_onDelete'];

        return new ForeignKey
        (
            $table_id, 
            $target_field,
            $reference_table,
            $reference_field,
            $on_update,
            $on_delete
        );
    } 

    /**
     * Debug prints object properties
     */
    public function out()
    {
        print PHP_EOL . "FOREIGN KEY targets: " . $this->target_table . "::" . $this->target_field;
        print PHP_EOL . "REFERENCES " . $this->reference_table . "::" . $this->reference_field;
        print PHP_EOL . "ON UPDATE " . $this->on_update;
        print PHP_EOL . "ON DELETE " . $this->on_delete . PHP_EOL;
    }
    
    /**
     * Outputs Constraint data in table constraint DDL fmt
     */
    public function table_constraint_ddl($table, $delim = "")
    {
        $ddl = 
        "FOREIGN KEY($this->target_field) REFERENCES $this->reference_table($this->reference_field)" . PHP_EOL . 
        "ON DELETE $this->on_delete" . $delim;
        "ON UPDATE $this->on_update" . PHP_EOL;

        return $ddl;
    }

    /**
     * Formats ForeignKey data to DML SELECT prepared statement
     * 
     * @return {string} statement
     */
    public function select_stmt( $assoc = false )
    {
        $where = "WHERE table_id = ? AND target_field = ?";
        
        if ( $assoc ) $where = "WHERE table_id=:table_id AND target_field=:target_field";
        
        return "SELECT * FROM ForeignKeys $where";
    }

    /**
     * Formats ForeignKey data into a prepared INSERT statement
     * 
     * @param  array  $values
     * @return string statement
     */
    public function insert_stmt( $values = [] )
    {
        return 
        [ 
        
            'stmt'   => 
            "INSERT INTO ForeignKeys (`table_id`, `target_field`, `reference_table`, `reference_field`, `on_delete`, `on_update`) VALUES (?, ?, ?, ?, ?, ?)",

            'values' => $values

        ];
    }  
}

/**
 * Database table field type data model
 */
class Type
{
    // ------------------------------
    // Class constants:
    // All possible field data types
    // ------------------------------

    public const UNDEFINED   = 0;
    public const BIT         = 1;   
    public const BLOB        = 2;         
    public const CLOB        = 4;
    public const CHAR        = 8;    
    public const TEXT        = 16;
    public const FLOATT      = 32;
    public const BINARY      = 64;
    public const DECIMAL     = 128;    
    public const DOUBLEE     = 256;
    public const INTEGERR    = 512;
    public const VARCHAR     = 1024;        
    public const BOOLEANN    = 2048;
    public const LONGTEXT    = 4096;
    public const VARBINARY   = 8192;   
    public const MEDIUMTEXT  = 16384;
    public const DATETIME    = 32768;
    public const TIMESTAMP   = 65536;

    // -----------------------------
    // Member properties:
    // field type
    // -----------------------------

    public $type = self::UNDEFINED;

    /**
     * Type constructor
     * 
     * @param {string} $type
     */
    public function __construct($type)
    {
        $this->type = $type;
    }

    /**
     * Prints debug output
     */
    public function out()
    {
        print PHP_EOL . "Type: " . const_name(__CLASS__, $this->type) . PHP_EOL;
    }
    
    /**
     * Returns the type constant name
     * 
     * @return {string}
     */
    public function title()
    {
        return (const_names(__CLASS__))[$this->type];
    }

    /**
     * Creates a Type form key
     * 
     * @param  {string} $key
     * @return {string}
     */
    public static function create_from_key($key)
    {
        $cls = new ReflectionClass(__CLASS__);
        $const_list = $cls->getConstants();
        return new Type($const_list[$key]);
    }

}
