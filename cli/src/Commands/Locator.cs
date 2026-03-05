using System.Text.Json;
using System.Text.RegularExpressions;

namespace UltrakillSaveCli.Commands;

static class Locator
{

    public static void Run()
    {
        var saveDirectory = FindSaveDirectory();

        if (saveDirectory == null)
        {
            Console.WriteLine("{}");
            return;
        }

        var files = Directory.GetFiles(saveDirectory, "*.bepis");

        var levels = new List<int>();
        var specials = new List<int>();
        var other = new List<string>();

        foreach (var file in files)
        {
            var name = Path.GetFileName(file);

            if (name.StartsWith("lvl", StringComparison.OrdinalIgnoreCase) &&
            name.EndsWith("progress.bepis", StringComparison.OrdinalIgnoreCase))
            {
                var numberPart = name[3..^"progress.bepis".Length];

                if (int.TryParse(numberPart, out int number))
                {
                    if (number >= 666)
                        specials.Add(number);
                    else
                        levels.Add(number);

                    continue;
                }


            }

            other.Add(name);
        }

        levels.Sort();
        specials.Sort();

        var result = new
        {
            directory = saveDirectory,
            levels,
            special = specials,
            other
        };

        Console.WriteLine(JsonSerializer.Serialize(result, new JsonSerializerOptions
        {
            WriteIndented = true
        }));
    }

    static string? FindSaveDirectory()
    {
        var localLow = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "..",
            "LocalLow",
            "Hakita",
            "ULTRAKILL",
            "Saves"
        );

        if (Directory.Exists(localLow))
            return Path.GetFullPath(localLow);

        var steamDefault = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
            "Steam",
            "steamapps",
            "common",
            "ULTRAKILL",
            "Saves",
            "Slot1"
        );

        if (Directory.Exists(steamDefault))
            return steamDefault;

        return null;
    }
}
