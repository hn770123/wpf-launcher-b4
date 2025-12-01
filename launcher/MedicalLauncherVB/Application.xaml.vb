Class Application
    Public Shared Token As String

    Protected Overrides Sub OnStartup(e As StartupEventArgs)
        MyBase.OnStartup(e)

        If e.Args.Length > 0 Then
            Dim uri As String = e.Args(0)
            If uri.Contains("token=") Then
                Dim parts = uri.Split(New String() {"token="}, StringSplitOptions.None)
                If parts.Length > 1 Then
                    Token = parts(1).Split("&"c)(0)
                End If
            End If
        End If

        ' デバッグ
        ' If String.IsNullOrEmpty(Token) Then Token = "DEBUG_TOKEN"

        Dim mainWindow As New MainWindow()
        mainWindow.Show()
    End Sub
End Class
