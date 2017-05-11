using EnvDTE;
using Microsoft.VisualStudio.TemplateWizard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace maceAddWebView.WindowsForms {
    public class Wizard : IWizard {
        public void BeforeOpeningFile(ProjectItem projectItem) {

        }

        public void ProjectFinishedGenerating(Project project) {

        }

        public void ProjectItemFinishedGenerating(ProjectItem projectItem) {

        }

        public void RunFinished() {

        }

        public void RunStarted(object automationObject, Dictionary<string, string> replacementsDictionary, WizardRunKind runKind, object[] customParams) {
            var form = new Form1();
            if (form.ShowDialog() == System.Windows.Forms.DialogResult.OK) {
                replacementsDictionary.Add("$ApiViewControllerName$", form.ApiViewViewContainerName.Text);
                replacementsDictionary.Add("$objectType$", form.ObjectType.Text);

            }
        }

        public bool ShouldAddProjectItem(string filePath) {
            return true;
        }
    }
}