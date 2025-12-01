Imports System.Net.Http
Imports System.Xml.Linq
Imports System.Diagnostics

Class MainWindow
    Private Const ApiBaseUrl As String = "http://localhost:3000/api"

    Private Sub MainWindow_Loaded(sender As Object, e As RoutedEventArgs) Handles Me.Loaded
        If String.IsNullOrEmpty(Application.Token) Then
            StatusText.Text = "No token provided. Please launch from the web dashboard."
            Return
        End If

        LoadConfig()
    End Sub

    Private Async Sub LoadConfig()
        Try
            StatusText.Text = "Fetching configuration..."
            Dim config = Await FetchConfigAsync(Application.Token)
            CategoriesControl.ItemsSource = config
            StatusText.Text = "Ready"
        Catch ex As Exception
            StatusText.Text = "Error loading configuration: " & ex.Message
            MessageBox.Show("Error loading configuration: " & ex.Message)
        End Try
    End Sub

    Private Async Function FetchConfigAsync(token As String) As Task(Of List(Of Category))
        Using client As New HttpClient()
            client.DefaultRequestHeaders.Authorization = New System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token)
            Dim response = Await client.GetAsync($"{ApiBaseUrl}/config")
            response.EnsureSuccessStatusCode()

            Dim xmlString = Await response.Content.ReadAsStringAsync()
            Return ParseConfig(xmlString)
        End Using
    End Function

    Private Function ParseConfig(xml As String) As List(Of Category)
        Dim categories As New List(Of Category)()
        Dim doc = XDocument.Parse(xml)

        For Each catElem In doc.Descendants("Category")
            Dim category As New Category With {
                .Name = If(catElem.Attribute("Name")?.Value, ""),
                .Apps = New List(Of AppItem)()
            }

            For Each appElem In catElem.Descendants("App")
                category.Apps.Add(New AppItem With {
                    .Name = If(appElem.Attribute("Name")?.Value, ""),
                    .Icon = If(appElem.Attribute("Icon")?.Value, ""),
                    .Path = If(appElem.Attribute("Path")?.Value, "")
                })
            Next

            categories.Add(category)
        Next

        Return categories
    End Function

    Private Sub AppButton_Click(sender As Object, e As RoutedEventArgs)
        Dim btn = TryCast(sender, Button)
        If btn IsNot Nothing AndAlso btn.Tag IsNot Nothing Then
            Dim path = btn.Tag.ToString()
            Try
                Process.Start(path)
            Catch ex As Exception
                MessageBox.Show($"Failed to launch app: {ex.Message}")
            End Try
        End If
    End Sub

    Private Sub Update_Click(sender As Object, e As RoutedEventArgs)
        MessageBox.Show("Checking for updates... (Not implemented yet)")
    End Sub
End Class

Public Class Category
    Public Property Name As String
    Public Property Apps As List(Of AppItem)
End Class

Public Class AppItem
    Public Property Name As String
    Public Property Icon As String
    Public Property Path As String
End Class
