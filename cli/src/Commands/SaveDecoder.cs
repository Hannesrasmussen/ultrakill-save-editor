using System.Text.Json;
using System.Text.RegularExpressions;

namespace UltrakillSaveCli.Commands;

static class SaveDecoder
{
  public static void Run(string[] args)
  {
    var saveDirectory = args.Length >= 2
      ? args[1]
      : Locator.FindSaveDirectory();

    saveDirectory = Path.GetFullPath(saveDirectory);

    if (!Directory.Exists(saveDirectory))
    {
      throw new DirectoryNotFoundException(
          $"Save directory was not found: {saveDirectory}"
      );
    }

    var levels = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
    var special = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
    var other = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);

    foreach (var filePath in Directory.GetFiles(saveDirectory, "*.bepis", SearchOption.TopDirectoryOnly))
    {
      var fileName = Path.GetFileName(filePath);
      var decoded = Decoder.DecodeFile(filePath);

      var levelMatch = Regex.Match(
          fileName,
          @"^lvl(\d+)progress\.bepis$",
          RegexOptions.IgnoreCase
      );

      if (levelMatch.Success)
      {
        var levelId = int.Parse(levelMatch.Groups[1].Value);

        if (levelId < 100)
        {
          levels[fileName] = decoded;
        }
        else
        {
          special[fileName] = decoded;
        }

        continue;
      }

      other[fileName] = decoded;
    }

    var payload = new
    {
      directory = saveDirectory,
      debugGroupingMarker = "SAVEDECODER_NEW_BUILD",
      levels,
      special,
      other
    };

    var options = new JsonSerializerOptions
    {
      WriteIndented = true,
      IncludeFields = true
    };

    var json = JsonSerializer.Serialize(payload, options);
    Console.WriteLine(json);
  }
}
