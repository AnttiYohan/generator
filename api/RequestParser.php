<?php

class RequestParser
{
    // -----------------------
    // - Properties
    // -----------------------
    public $lines = [];
    public $mainContentType = "";

    /**
     * Initialize input
     */
    public function __construct($input)
    {
        $token = strtok($input, PHP_EOL);

        while ($token !== false)
        {
            $this->lines[] = $token;
            $token = strtok(PHP_EOL);
        }
    }

    public function displayFirstLines()
    {
        for ($i = 0; $i < 3; $i++)
        {
            echo $this->lines[$i] . PHP_EOL;
        }
    }

    public static function getMainContentType()
    {
        $input = $_SERVER['CONTENT_TYPE'];
        $retval = "";

        if (strlen($input))
        {
            $pos = strpos($input, ';');

            if ($pos !== false)
            {
                $retval = substr($input, 0, $pos);
            }
        }
        
        return $retval;
    }

    /**
     * Finds the Content-Type header and returns its value
     */
    public static function getBlockContentType($input)
    {
        $pattern = "Content-Type:";
        $token = strtok($input, PHP_EOL);
        $rest = "";
        while ($token !== false)
        {
            $pos = stripos($token, $pattern);

            if ($pos !== false)
            {
                $rest = trim(substr($token, $pos + strlen($pattern)));
                break;
            }

            $token = strtok(PHP_EOL);
        }
        
        return $rest;
    }

    /**
     * Parses the content type value from a line
     * 
     * @param  {string} $line
     * @return {string}
     */
    public static function getContentType($line)
    {
        $pattern = "Content-Type:";
        $pos = stripos($line, $pattern);
        $retval = "";

        if ($pos !== false)
        {
            $retval = trim(substr($line, $pos + strlen($pattern)));
        
        }
        
        return $retval;
    }

    /**
     * Evaluates whether the request content is multipart
     */
    public static function isMultipart()
    {
        $retval = false;

        if (self::getMainContentType() === "multipart/midex") $retval = true;

        return $retval;
    }

    /**
     * Retuns the individual blocks of a multipart request
     */
    public static function getMultipartBlocks($input)
    {
        $formatted_block_list = [];

        if (self::getMainContentType() === "multipart/mixed")
        {
            preg_match('/boundary=(.*)$/', $_SERVER['CONTENT_TYPE'], $matches);

            $boundary = $matches[1];
            $block_list = preg_split("/--$boundary/", $input);
            
            foreach ($block_list as $block)
            {
                $formatted_block_list[] = self::parseBlock($block);
            }
        }
        else
        {
            echo PHP_EOL . "No multipart request" . PHP_EOL;
        }

        return $formatted_block_list;
    }

    /**
     * Strips headers from a block
     * 
     * @param  {string} $block
     * @return {string}
     */
    public static function stripBlockHeader($block)
    {
        $lines = explode(PHP_EOL, $block);
        $content = [];
        $retval = "";
        // - strip headers
        foreach ($lines as $line)
        {
            if (stripos($line, "Content-") !== 0)
            {
                $content[] = $line;
            }
        }

        if (count($content))
        {
            $retval = implode(PHP_EOL, $content);
        }

        return $retval;
    }

    /**
     * Parses the header from the block data and returns an array
     * with headers and data in separat indices
     * 
     * @param  {string} $block
     * @return {array}
     */
    public static function parseBlock($block)
    {
        $lines = explode(PHP_EOL, $block);
        $content = [];
        $contentType = "";
        $fileName = "";
        $rawData = "";
        // - strip headers
        foreach ($lines as $line)
        {
            if (stripos($line, "Content-Type:") === 0)
            {
                $contentType = self::getContentType($line);
            }
            elseif (stripos($line, "Content-Disposition:") === 0)
            {
                $pattern = "file=";
                $pos = stripos($line, $pattern);
                $fileName = trim(substr($line, strlen($pattern) + $pos), " '\"");
            }
            else
            {
                $content[] = $line;
            }
        }

        if (count($content))
        {
            $rawData = implode(PHP_EOL, $content);
        }

        return
        [
            "Content-Type"  => $contentType,
            "file"          => $fileName,
            "content"       => $rawData
        ];
    }    

}