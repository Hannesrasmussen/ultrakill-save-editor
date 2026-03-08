using System.Text.Json;
using System.Text.RegularExpressions;

namespace UltrakillSaveCli.Commands;

static class Locator
{
    private sealed class SaveSlotScanResult
    {
        public string Slot { get; init; } = "";
        public string Directory { get; init; } = "";
        public List<int> Levels { get; init; } = new();
        public List<int> Special { get; init; } = new();
        public List<string> Other { get; init; } = new();
    }

    public static string FindSavesDirectory()
    {
        var candidates = new[]
        {
            Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
                "Steam",
                "steamapps",
                "common",
                "ULTRAKILL",
                "Saves"
            ),
            Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
                "Steam",
                "steamapps",
                "common",
                "ULTRAKILL",
                "Saves"
            )
        };

        foreach (var candidate in candidates)
        {
            if (Directory.Exists(candidate))
                return candidate;
        }

        throw new DirectoryNotFoundException("Could not find ULTRAKILL Saves folder.");
    }

    public static List<string> FindSaveSlotDirectories(string? savesDirectory = null)
    {
        var root = savesDirectory ?? FindSavesDirectory();

        return Directory
            .GetDirectories(root, "Slot*", SearchOption.TopDirectoryOnly)
            .Where(path => Regex.IsMatch(Path.GetFileName(path), @"^Slot\d+$", RegexOptions.IgnoreCase))
            .OrderBy(path =>
            {
                var name = Path.GetFileName(path);
                var match = Regex.Match(name, @"^Slot(\d+)$", RegexOptions.IgnoreCase);
                return match.Success ? int.Parse(match.Groups[1].Value) : int.MaxValue;
            })
            .ThenBy(path => path, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static string FindSaveDirectory()
    {
        var slotDirectories = FindSaveSlotDirectories();

        if (slotDirectories.Count == 0)
            throw new DirectoryNotFoundException("Could not find any ULTRAKILL save slots.");

        var slot1 = slotDirectories.FirstOrDefault(path =>
            string.Equals(Path.GetFileName(path), "Slot1", StringComparison.OrdinalIgnoreCase)
        );

        return slot1 ?? slotDirectories[0];
    }

    private static SaveSlotScanResult ScanSlotDirectory(string slotDirectory)
    {
        var allBepisFiles = Directory
            .GetFiles(slotDirectory, "*.bepis", SearchOption.TopDirectoryOnly)
            .ToList();

        var missionFiles = allBepisFiles
            .Select(path => new
            {
                Path = path,
                Match = Regex.Match(
                    Path.GetFileName(path),
                    @"^lvl(\d+)progress\.bepis$",
                    RegexOptions.IgnoreCase
                )
            })
            .Where(x => x.Match.Success)
            .Select(x => new
            {
                Path = x.Path,
                LevelId = int.Parse(x.Match.Groups[1].Value)
            })
            .ToList();

        var levels = missionFiles
            .Where(x => x.LevelId < 100)
            .Select(x => x.LevelId)
            .OrderBy(number => number)
            .ToList();

        var special = missionFiles
            .Where(x => x.LevelId >= 100)
            .Select(x => x.LevelId)
            .OrderBy(number => number)
            .ToList();

        var other = allBepisFiles
            .Where(path =>
                !Regex.IsMatch(
                    Path.GetFileName(path),
                    @"^lvl(\d+)progress\.bepis$",
                    RegexOptions.IgnoreCase
                )
            )
            .Select(Path.GetFileName)
            .Where(name => name is not null)
            .Select(name => name!)
            .OrderBy(name => name)
            .ToList();

        return new SaveSlotScanResult
        {
            Slot = Path.GetFileName(slotDirectory),
            Directory = slotDirectory,
            Levels = levels,
            Special = special,
            Other = other
        };
    }

    public static void Run()
    {
        var savesDirectory = FindSavesDirectory();
        var slotDirectories = FindSaveSlotDirectories(savesDirectory);
        var slotSummaries = slotDirectories
            .Select(ScanSlotDirectory)
            .ToList();

        var selected = slotSummaries
            .FirstOrDefault(slot =>
                string.Equals(slot.Slot, "Slot1", StringComparison.OrdinalIgnoreCase)
            )
            ?? slotSummaries.FirstOrDefault();

        var payload = new
        {
            savesDirectory = savesDirectory,
            slot = selected?.Slot,
            directory = selected?.Directory,
            levels = selected?.Levels ?? new List<int>(),
            special = selected?.Special ?? new List<int>(),
            other = selected?.Other ?? new List<string>(),
            slots = slotSummaries.Select(slot => new
            {
                slot = slot.Slot,
                directory = slot.Directory,
                levels = slot.Levels,
                special = slot.Special,
                other = slot.Other
            })
        };

        var options = new JsonSerializerOptions
        {
            WriteIndented = true
        };

        Console.WriteLine(JsonSerializer.Serialize(payload, options));
    }
}
