using System.Reflection;

namespace UltrakillSaveCli.Commands;

static class AssemblyLocator
{
    private static readonly Lazy<string> ManagedDirectory = new(() =>
    {
        var possibleRoots = new[]
        {
            Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
                "Steam",
                "steamapps",
                "common",
                "ULTRAKILL"
            )
        };

        foreach (var root in possibleRoots)
        {
            if (!Directory.Exists(root))
                continue;

            var managed = Path.Combine(root, "ULTRAKILL_Data", "Managed");

            if (Directory.Exists(managed))
                return managed;
        }

        throw new DirectoryNotFoundException(
            "Unable to locate ULTRAKILL Managed directory."
        );
    });

    private static readonly Lazy<Assembly> GameAssembly = new(() =>
    {
        var managed = ManagedDirectory.Value;

        var unityPath = Path.Combine(managed, "UnityEngine.CoreModule.dll");
        var gamePath = Path.Combine(managed, "Assembly-CSharp.dll");

        if (!File.Exists(unityPath))
            throw new FileNotFoundException("UnityEngine.CoreModule.dll not found.", unityPath);

        if (!File.Exists(gamePath))
            throw new FileNotFoundException("Assembly-CSharp.dll not found.", gamePath);

        // Load dependency first
        Assembly.LoadFrom(unityPath);

        // Load game assembly
        return Assembly.LoadFrom(gamePath);
    });

    public static Assembly GetGameAssembly()
    {
        return GameAssembly.Value;
    }
}
