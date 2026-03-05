using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text.Json;

namespace UltrakillSaveCli.Commands;

static class Encoder
{
    public static void Run(string[] args)
    {
        if (args.Length < 3)
            throw new ArgumentException("encode requires <input.json> <output.bepis>");

        string jsonPath = args[1];
        string outputSave = args[2];

        if (!File.Exists(jsonPath))
            throw new FileNotFoundException("Input JSON file not found.", jsonPath);

        var json = File.ReadAllText(jsonPath);

        var gameAssembly = AssemblyLocator.GetGameAssembly();

        var rankDataType = gameAssembly.GetType("RankData")
            ?? throw new InvalidOperationException("RankData type not found in Assembly-CSharp.dll");

#pragma warning disable SYSLIB0050
        var data = FormatterServices.GetUninitializedObject(rankDataType);
#pragma warning restore SYSLIB0050

        var document = JsonDocument.Parse(json);

        foreach (var field in rankDataType.GetFields())
        {
            if (!document.RootElement.TryGetProperty(field.Name, out var jsonValue))
                continue;

            object? value = JsonSerializer.Deserialize(
                jsonValue.GetRawText(),
                field.FieldType,
                new JsonSerializerOptions { IncludeFields = true }
            );

            field.SetValue(data, value);
        }

#pragma warning disable SYSLIB0011
        var formatter = new BinaryFormatter();
#pragma warning restore SYSLIB0011

        using var fs = File.Create(outputSave);

        formatter.Serialize(fs, data);

        Console.WriteLine($"Modified save written to {outputSave}");
    }
}
