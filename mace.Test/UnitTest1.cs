using System;
using System.IO;
using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace mace.Test {
    [TestClass]
    public class SimpleMinification {

        [TestMethod]
        public void MakeBowerFiles() {
            //var jsFile = writeBundle(".js");
            var tsFile = writeBundle(".ts");

            var path = pathToRoot();            

            //C:\Users\Nathan\Documents\GitHub\mace\macejs\wwwroot\js
            System.IO.File.Copy(path + @"\macejs\wwwroot\js\mace.js", Path.Combine(path, "mace.js"), true);
            System.IO.File.Copy(path + @"\macejs\wwwroot\js\mace.min.js", Path.Combine(path, "mace.min.js"), true);
            //var contents = System.IO.File.ReadAllText(jsFile);
            //var pattern = @"\r\n|\t|\s\s";
            //var comments = @"//.*?\r\n";
            //var min = System.Text.RegularExpressions.Regex.Replace(contents, comments, "");
            //var newFilePath = Path.Combine(pathToRoot(), "mace.min.js");

            //create the ts file from merging the bundles together and
            //    use the already minified mace.min.js file

            //min = System.Text.RegularExpressions.Regex.Replace(min, pattern, "");
            //System.IO.File.WriteAllText(newFilePath, min);
            //Assert.IsTrue(System.IO.File.Exists(jsFile) && System.IO.File.Exists(tsFile) && System.IO.File.Exists(newFilePath));
        }

        string writeBundle(string extension)
        {
            var javascriptDirectories = new List<string>() {
                "Classes", "Interfaces", "Modules", "Prototypes"
            };
            var sb = new System.Text.StringBuilder();
            var root = pathToRoot();
            var newFilePath = Path.Combine(root, "mace" + extension);
            foreach (var dir in javascriptDirectories)
            {
                var dirToBundle = Path.Combine(pathToMaceWeb(), dir);
                var files = System.IO.Directory.GetFiles(dirToBundle, "*" + extension);
                foreach (var file in files)
                {
                    sb.AppendLine(System.IO.File.ReadAllText(file));
                }
            }
            System.IO.File.WriteAllText(newFilePath, sb.ToString());
            return newFilePath;
        }

        string pathToRoot()
        {
            var path = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase).Replace("file:\\", "");
            path = path.Substring(0, path.LastIndexOf(@"\mace\") + 5);
            return path;
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
            path = path.Substring(0, path.LastIndexOf(@"\mace\") + 5) + "\\macejs\\wwwroot\\scripts";
            return path;
        }
    }
}
