using System;
using System.Windows;

namespace MedicalLauncher
{
    public partial class App : Application
    {
        public static string Token { get; private set; }

        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            // 期待される引数: medlauncher://token=XYZ または token=XYZ (渡し方による)
            // 通常、URI全体が最初の引数として渡されます
            if (e.Args.Length > 0)
            {
                string uri = e.Args[0];
                // シンプルな解析ロジック
                if (uri.Contains("token="))
                {
                    var parts = uri.Split(new[] { "token=" }, StringSplitOptions.None);
                    if (parts.Length > 1)
                    {
                        Token = parts[1].Split('&')[0]; // 他のパラメータがある場合の処理
                    }
                }
            }

            // トークンが渡されなかった場合のテスト/デバッグ用
            if (string.IsNullOrEmpty(Token))
            {
                // Token = "DEBUG_TOKEN"; 
                // 本番環境では、エラーを表示するか、ランチャー経由でのログインを要求する場合があります (実装されている場合)
            }

            MainWindow mainWindow = new MainWindow();
            mainWindow.Show();
        }
    }
}

