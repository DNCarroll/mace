using System;
using System.IO;
using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace mace.Test {
    [TestClass]
    public class SimpleMinification {
        [TestMethod]
        public void MakeMinifiedMaceJs() {
            writeMaceJsFile();
            var path = Path.Combine(pathToMaceWeb(), "Scripts");
            var file = Path.Combine(path, "mace.js");
            var contents = System.IO.File.ReadAllText(file);
            var pattern = @"\r\n|\t|\s\s";
            var comments = @"//.*?\r\n";
            var min = System.Text.RegularExpressions.Regex.Replace(contents, comments, "");
            var newFilePath = Path.Combine(path, "mace.min.js");

            min = System.Text.RegularExpressions.Regex.Replace(min, pattern, "");
           
            System.IO.File.WriteAllText(newFilePath, min);
            var exists = existsAndIsNew(newFilePath);
            Assert.IsTrue(exists);
        }

        void writeMaceJsFile()
        {
            var typeScriptDirectories = new List<string>() {
                "Classes", "Interfaces", "Modules", "Prototypes"
            };
            var sb = new System.Text.StringBuilder();
            var path = pathToMaceWeb();
            var newFilePath = Path.Combine(path, "Scripts", "mace.js");
            foreach (var dir in typeScriptDirectories)
            {
                var dirToBundle = Path.Combine(path, dir);
                var files = System.IO.Directory.GetFiles(dirToBundle, "*.js");
                foreach (var file in files)
                {
                    sb.AppendLine(System.IO.File.ReadAllText(file));
                }
            }
            System.IO.File.WriteAllText(newFilePath, sb.ToString());
        }

        bool existsAndIsNew(string file) {
            var exists = System.IO.File.Exists(file);
            if (exists) {
                var fi = new FileInfo(file);
                exists = DateTime.Now.Subtract(fi.LastWriteTime).TotalSeconds < 5;
            }
            return exists;
        }

        [TestMethod]
        public void MakeMaceTsBundle() {            
            var typeScriptDirectories = new List<string>() {
                "Classes", "Interfaces", "Modules", "Prototypes"
            };
            var sb = new System.Text.StringBuilder();
            var path = pathToMaceWeb();
            var newFilePath = Path.Combine(path, "Scripts", "mace.ts");
            foreach (var dir in typeScriptDirectories) {
                var dirToBundle = Path.Combine(path, dir);
                var files = System.IO.Directory.GetFiles(dirToBundle, "*.ts");
                foreach (var file in files) {
                    sb.AppendLine(System.IO.File.ReadAllText(file));
                }
            }
            System.IO.File.WriteAllText(newFilePath, sb.ToString());

            var exists = existsAndIsNew(newFilePath);
            Assert.IsTrue(exists);
        }

        string pathToMaceWeb() {
            var path = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase).Replace("file:\\", "");
            path = Path.Combine(path.Substring(0, path.LastIndexOf(@"\mace\") + 5), "mace");
            return path;
        }
    }
}
