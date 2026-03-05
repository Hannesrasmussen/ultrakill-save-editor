using UltrakillSaveCli.Commands;

namespace UltrakillSaveCli;

static class Program
{
    static void PrintUsage()
    {
        Console.WriteLine("Usage:");
        Console.WriteLine("  decode <input.bepis> <output.json>");
        Console.WriteLine("  encode <input.json> <output.bepis>");
        Console.WriteLine("  scan");
    }

    static void Main(string[] args)
    {
        if (args.Length == 0)
        {
            PrintUsage();
            return;
        }

        var command = args[0].ToLower();

        try
        {
            switch (command)
            {
                case "decode":
                    Decoder.Run(args);
                    break;

                case "encode":
                    Encoder.Run(args);
                    break;

                case "scan":
                    Locator.Run();
                    break;

                default:
                    Console.WriteLine("Unknown command.");
                    Console.WriteLine();
                    PrintUsage();
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error:");
            Console.WriteLine(ex.Message);
        }
    }
}