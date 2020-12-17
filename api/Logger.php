<?php

class Logger
{
    protected const FILE = "log.txt";

    public static function errlog($e, $f, $l)
    {
        if (is_writable(self::FILE))
        {
            if ($f = fopen(self::FILE, 'a'))
            {
                fwrite($f, "Error: " . $e . " - at " . $f . ":" . $l . PHP_EOL);
                fclose($f);
            }
        }
    }

    public static function errstr($e, $f, $l)
    {
        return "Log error: " . $e . PHP_EOL . "At file: " . $f . ", line: " . $l;
    }

    public static function errmsg($e, $f, $l)
    {
        return 
        [
            "msg" => "error",
            "log" => $e . PHP_EOL . "at file: " . $f . ", line: " . $l
        ];
    }
}