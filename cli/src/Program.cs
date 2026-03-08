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
        Console.WriteLine("  decode-save [slotDirectory]");
    }

    static void Main(string[] args)
    {
        if (args.Length == 0)
        {
            PrintUsage();
            return;
        }

        var command = args[0].ToLowerInvariant();

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

                case "decode-save":
                    SaveDecoder.Run(args);
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
            Console.Error.WriteLine("Error:");
            Console.Error.WriteLine(ex.Message);
        }
    }
}
