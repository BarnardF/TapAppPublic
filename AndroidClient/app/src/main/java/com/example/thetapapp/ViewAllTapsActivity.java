package com.example.thetapapp;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 ViewAllTapsActivity:
 Fetches all taps from node server and displays all data through a custom list component ""
 */
public class ViewAllTapsActivity extends AppCompatActivity {


    private ProgressBar progressBar;
    private TapList m_tapList;

    private static final String API_URL = "http://taptasticitdma.freedynamicdns.org:3000/api/public/taps";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_all_taps);

        progressBar = findViewById(R.id.progressBar);
        m_tapList = findViewById(R.id.tapsContainer);
        // Fetch and display data
        fetchTaps();
    }

    /**
     Fetches all taps from the backend API.
     Runs on a background thread to avoid blocking the main UI thread.
     */
    private void fetchTaps() {
        progressBar.setVisibility(View.VISIBLE);

        new Thread(() -> {
            try {

                URL url = new URL(API_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");


                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    response.append(line);
                }
                in.close();


                JSONObject jsonResponse = new JSONObject(response.toString());
                JSONArray data = jsonResponse.getJSONArray("data");

                // Update UI with results
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    m_tapList.setData(jsonResponse);
                });

            } catch (Exception e) {
                // Handle network or parsing errors
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(this, "Failed to load taps", Toast.LENGTH_SHORT).show();
                });
                e.printStackTrace();
            }
        }).start();
    }
}
