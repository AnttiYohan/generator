<?php

class ModelParser
{
    public $state = "unprepared";
    public $model = null;
    public $tableList = [];

    public function __construct($json, $param)
    {
        $data = json_decode($json, TRUE);

        echo PHP_EOL . "Model is $model" . PHP_EOL;
        if ($data !== NULL)
        {
            echo "not null" . PHP_EOL;
            if (isset($data["table"]))
            {
                echo PHP_EOL . "ModelParser Entry: " . $data["name"] . PHP_EOL;
                echo "expecting result " . $data["result"] . PHP_EOL;
            }

            $this->model = new ModelTable($param);
            $this->createModelTable($this->model, $data, $param);
            $state = "loaded";
        }
    }

    public function createModelTable($modelTable, $data, $param)
    {
        if (isset($data["result-alias"]))
        {
            echo PHP_EOL . "Result alias at " . $data["table"] . " is " . 
            $data["result-alias"] . PHP_EOL;
        }

        //$modelTable = new ModelTable($param);

        if (isset($data["display"])) $modelTable->loadDisplays($data["display"]);

        if (isset($data["table"]) && isset($data["result"]) && isset($data["group-by"]))
        {
            $modelTable->createSelectStmt($data["table"], $data["result"], $data["group-by"]);
        }

        $modelTable->out();

        if (isset($data["children"])) foreach ($data["children"] as $child)
        {
            $childParam = $modelTable->result;

            echo PHP_EOL . "spawning a child, param as " . $childParam;
            if (isset($child["result-alias"]))
            {
                $childParam = $child["result-alias"];
                echo "Found result-alias, param changed to " . $childParam;
            }
            echo PHP_EOL;

            $childModelTable = new ModelTable($childParam);

            $this->createModelTable($childModelTable, $child, $childParam);

            $modelTable->addChild($childModelTable);
        }
       
    }

    public function select_stmt()
    {
        $stmt = 
        "SELECT " . $this->table->fieldSet() . 
        " FROM " . $this->table->source() . $this->table->groupBy();

        return $stmt;
    }

}

class ModelTable
{
    public $query = "";
    public $result = "";
    public $children = [];
    public $name  = "";
    public $table = "";
    public $index = "";
    public $group_by = "";
    public $displayList = [];

    public $param = "";
    
    public function __construct($param)
    {
        $this->param = $param;
    }

    public function setName($value)    { $this->name  = $value; }
    public function setTable($value)   { $this->table = $value; }
    public function setIndex($value)   { $this->index = $value; }
    public function setParam($value)   { $this->param = $value; }
    public function setGroupBy($value) { $this->group_by = $value; }

    public function createSelectStmt($table, $result, $group_by)
    {
        $this->group_by = $group_by;
        $this->result = $result;
        $this->table  = $table;

        $this->query =
        "SELECT " . $this->displayString($result) . 
        " FROM " . $table . $this->pdo_where();
    }

    public function displayString($result)
    {
        $output = $result;
        $c = 0;

        foreach($this->displayList as $display)
        {
            $output .= ", $display";
        }

        return $output;
    }

    public function addChild($model)
    {
        $this->children[] = $model;
    }

    public function addDisplay($field)
    {
        $this->displayList[] = $field;
    }

    public function loadDisplays($displayList)
    {
        foreach($displayList as $display)
        {
            if (isset($display["field"]))
            {
                $this->addDisplay($display["field"]);
            }
        }
    }

    public function fieldSet()
    {
        $output = count($this->displayList) ? "" : "*";
        $c = 0;

        foreach ($this->displayList as $display)
        {
            if ($c) $output .= ", ";
            $output .= $display->field;
            $c = 1;
        }

        return $output;
    }

    public function source()
    {
        return $this->table;
    }

    public function groupBy()
    {
        return $this->group_by . "='" . $this->param . "'";
    }

    public function pdo_where()
    {
        $output = "";

        if (strlen($this->group_by)) 
        {
            $output = " WHERE " . $this->group_by . "=?";
        }

        return $output;
    }

    public function out()
    {
        echo PHP_EOL . $this->query .   PHP_EOL;
        echo "params: " . $this->param . PHP_EOL;
    }
}

class Display 
{
    public $table = "";
    public $field = "";

    public function __construct($table, $field)
    {
        $this->table = $table;
        $this->field = $field;
    }
}

