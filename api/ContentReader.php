<?php

/**
 * This class is a container for Insert statements
 * the container is modeled as an database.
 * The database has a list of tables,
 * A table has its columns and a list of
 * rows, which contain the values to be inserted
 */
class ContentReader
{
    public $apiName = "";
    public $tableList = [];
    public $fileList  = [];

    public function tableList()
    {
        return $this->tableList;
    }

    public function loadFileList($fileList)
    {
        foreach($fileList as $file)
        {
            if (isset($file["file"]) && isset($file["content"]))
            {
                $this->fileList[$file["file"]] = $file["content"];
            }
        }
    }

    /**
     * Parses the input data and tries to model
     * MySQL Insert statements from it
     * 
     * @param {string} $data
     */
    public function parseApi($data)
    {
        if (isset($data["api"])) $this->apiName = $data["api"];

        if (isset($data["table_list"])) foreach($data["table_list"] as $table)
        {
            $this->tableList[] = new Table($table, $this->fileList);
        }
    }

    /**
     * Prints the formed Insert statements
     */
    public function out()
    {
        echo PHP_EOL . $this->apiName . PHP_EOL;

        foreach ($this->tableList as $table)
        {
            foreach ($table->insert_list() as $insert_stmt)
            {
                echo PHP_EOL . "Statement: " . $insert_stmt . PHP_EOL;
            }
            if (count($table->fileList)) foreach($table->fileList as $file)
            {
                echo "FILE: $file " . PHP_EOL;
            }            
        }
    }

    public function fileList()
    {

    }
}

/**
 * Models a Relational database table
 * Formats the data into Insert statements
 */
class Table
{
    // --------------------------------------------------------------
    // - Members
    // --------------------------------------------------------------

    public $tableName       = "";
    public $columnList      = [];
    public $rowList         = [];
    public $filePointerList = [];
    public $fileList        = [];

    /**
     * Forms a list of insert statmenents from the input data
     * 
     * @param {string} $data
     */
    public function __construct($data, $fileList)
    {
        if (isset($data["type"])) $this->tableName  = $data["name"];

        if ($data["type"] === "ssv")
        {
            if (isset($data["params"])) foreach($data["params"] as $param)
            {
                $this->columnList[] = $param;
            }

            if (isset($data["content"])) foreach($data["content"] as $content)
            {
                $this->addRow(explode(" ", $content));
            }
        }
        elseif ($data["type"] === "keyed")
        {
            $contentList = [];
            $keyCount = 0;

            if (isset($data["params"])) foreach($data["params"] as $param)
            {
                $keyCount = 0;
                if (isset($param["key"]))
                {
                    $key = $param["key"];
                    $this->columnList[] = $param["key"];

                    if (isset($param["content"])) foreach($param["content"] as $content)
                    {
                        if (isset($param["type"]) && $param["type"] === "filepointer")
                        {
                            $this->filePointerList[] = $content;
                            //echo PHP_EOL . "Content FilePointer: $content" . PHP_EOL;

                            if (array_key_exists($content, $fileList))
                            {
                                //echo PHP_EOL . "key $content exist in filelist" . PHP_EOL;
                                $contentList[$key][] = $fileList[$content];
                                unset($fileList[$content]);
                            }
                        }
                        else
                        {
                            $contentList[$key][] = $content;
                        }

                        $keyCount++;
                    }
                }    
            }

            for ($i = 0; $i < $keyCount; $i++)
            {
                $valueList = [];
                foreach($this->columnList as $key)
                {
                    $valueList[] = $contentList[$key][$i];
                }

                $this->addRow($valueList);
            }
        }
    }

    /**
     * Adds a row of values to the table model
     * 
     * @param {array} $valueList
     */
    public function addRow($valueList)
    {
        $this->rowList[] = new ValueRow($valueList);
    }

    /**
     * Creates an INSERT statement
     * 
     * @param  {ValueRow} $row
     * @return {string}
     */
    public function insert_stmt($row)
    {
        $stmt = "INSERT INTO $this->tableName (";

        $c = 0;

        foreach ($this->columnList as $column)
        {
            if ($c) $stmt .= ", ";
            $stmt .= $column;
            $c = 1;
        }

        $stmt .= ") " . $row->insert_stmt();

        return $stmt;
    }

    /**
     * Creates an array of INSERT Statements
     * 
     * @return {array}
     */
    public function insert_list()
    {
        $list = [];

        foreach ($this->rowList as $row)
        {
            $list[] = $this->insert_stmt($row);
        }

        return $list;
    }

    public function pdo_insert_stmt($row)
    {
        $stmt   = "INSERT INTO $this->tableName (";
        $values = "VALUES(";
        $c = 0;

        foreach ($this->columnList as $column)
        {
            if ($c) 
            {
                $stmt   .= ", ";
                $values .= ", ";
            }

            $stmt   .= $column;
            $values .= "?";

            $c = 1;
        }

        $values .= ")";
        $stmt   .= ") " . $values;

        return
        [
            "prepare" => $stmt,
            "execute" => $row->valueList()
        ];
    }

    public function pdo_insert_list()
    {
        $list = [];

        foreach ($this->rowList as $row)
        {
            $list[] = $this->pdo_insert_stmt($row);
        }

        return $list;
    }

    public function filePointerCount()
    {
        return count($this->fileList);
    }

    public function resolveFilePointers($blockList)
    {
        $retval = FALSE;

        if (count($blockList) >= $this->filePointerCount())
        {
            foreach($this->fileList as $filePointer)
            {

            }
        }
    }
}

/**
 * Model a Relational Database table row with a list of values
 * Formats the data into INSERT Statement
 */
class ValueRow
{
    public $valueList = [];

    /**
     * Constructs a value list from
     */
    public function __construct($valueList)
    {
        $this->valueList = $valueList;
    }

    /**
     * Creates the VALUES clause of an INSERT statement
     */
    public function insert_stmt()
    {
        $stmt = "VALUES(";

        $c = 0;

        foreach ($this->valueList as $value)
        {
            if ($c) $stmt .= ", ";
            $stmt .= $value;
            $c = 1;
        }

        $stmt .= ")";

        return $stmt;
    }

    public function valueList()
    {
        return $this->valueList;
    }
}