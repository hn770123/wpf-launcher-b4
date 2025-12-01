using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Xml.Linq;

namespace MedicalLauncher
{
    public partial class MainWindow : Window
    {
        private const string ApiBaseUrl = "http://localhost:3000/api";

        public MainWindow()
        {
            InitializeComponent();
            Loaded += MainWindow_Loaded;
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(App.Token))
            {
                StatusText.Text = "No token provided. Please launch from the web dashboard.";
                // 本番環境では、閉じるかログインダイアログを表示する可能性があります
                return;
            }

            try
            {
                StatusText.Text = "Fetching configuration...";
                var config = await FetchConfigAsync(App.Token);
                CategoriesControl.ItemsSource = config;
                StatusText.Text = "Ready";
            }
            catch (Exception ex)
            {
                StatusText.Text = "Error loading configuration: " + ex.Message;
                MessageBox.Show("Error loading configuration: " + ex.Message);
            }
        }

        private async Task<List<Category>> FetchConfigAsync(string token)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                var response = await client.GetAsync($"{ApiBaseUrl}/config");
                response.EnsureSuccessStatusCode();

                var xmlString = await response.Content.ReadAsStringAsync();
                return ParseConfig(xmlString);
            }
        }

        private List<Category> ParseConfig(string xml)
        {
            var categories = new List<Category>();
            var doc = XDocument.Parse(xml);

            foreach (var catElem in doc.Descendants("Category"))
            {
                var category = new Category
                {
                    Name = catElem.Attribute("Name")?.Value,
                    Apps = new List<AppItem>()
                };

                foreach (var appElem in catElem.Descendants("App"))
                {
                    category.Apps.Add(new AppItem
                    {
                        Name = appElem.Attribute("Name")?.Value,
                        Icon = appElem.Attribute("Icon")?.Value,
                        Path = appElem.Attribute("Path")?.Value
                    });
                }

                categories.Add(category);
            }

            return categories;
        }

        private void AppButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is string path)
            {
                try
                {
                    Process.Start(path);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Failed to launch app: {ex.Message}");
                }
            }
        }

        private void Update_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Checking for updates... (Not implemented yet)");
        }
    }

    public class Category
    {
        public string Name { get; set; }
        public List<AppItem> Apps { get; set; }
    }

    public class AppItem
    {
        public string Name { get; set; }
        public string Icon { get; set; }
        public string Path { get; set; }
    }
}