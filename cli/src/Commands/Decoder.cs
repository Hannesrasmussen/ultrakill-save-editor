using System.Runtime.Serialization.Formatters.Binary;
using System.Text.Json;

namespace UltrakillSaveCli.Commands;

static class Decoder
{
    public static object DecodeFile(string savePath)
    {
        if (!File.Exists(savePath))
            throw new FileNotFoundException("Input save file not found.", savePath);

        // Ensure assemblies are loaded
        AssemblyLocator.GetGameAssembly();

#pragma warning disable SYSLIB0011
        var formatter = new BinaryFormatter();
#pragma warning restore SYSLIB0011

        using var fs = File.OpenRead(savePath);

        return formatter.Deserialize(fs);
    }

    public static void Run(string[] args)
    {
        if (args.Length < 3)
            throw new ArgumentException("decode requires <input.bepis> <output.json>");

        string savePath = args[1];
        string outputPath = args[2];

        var saveObject = DecodeFile(savePath);

        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            IncludeFields = true
        };

        var json = JsonSerializer.Serialize(saveObject, options);

        File.WriteAllText(outputPath, json);

        Console.WriteLine($"JSON exported to {outputPath}");
    }
}