package com.example.thetapapp;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.ProgressBar;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class QueryResultsActivity extends AppCompatActivity {

    private TapList tapResultsContainer;
    private ProgressBar progressBar;

    // moet nog dit doen
    private static final String API_URL = "http://taptasticitdma.freedynamicdns.org:3000/api/public/taps/query";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_query_results);

        tapResultsContainer = findViewById(R.id.tapResultsContainer);
        progressBar = findViewById(R.id.progressBar);

        String filtersJson = getIntent().getStringExtra("filters");
        if (filtersJson != null) {
            performSearch(filtersJson);
        } else {
            Toast.makeText(this, "No filters provided", Toast.LENGTH_SHORT).show();
        }
    }

    private void performSearch(String filtersJson) {
        progressBar.setVisibility(android.view.View.VISIBLE);

        new Thread(() -> {
            try {
                URL url = new URL(API_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setDoOutput(true);

                Log.d("API_REQUEST", filtersJson);

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = filtersJson.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                } catch(Exception e) {
                    e.printStackTrace();
                }

                int responseCode = conn.getResponseCode();
                InputStream inputStream = (responseCode >= 200 && responseCode < 300)
                        ? conn.getInputStream()
                        : conn.getErrorStream();

                StringBuilder response = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, "utf-8"))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line.trim());
                    }
                }


                JSONObject jsonResponse = new JSONObject(response.toString());

                runOnUiThread(() -> {
                    progressBar.setVisibility(android.view.View.GONE);

                    try {


                        if(jsonResponse.optString("success")=="true") {
                            tapResultsContainer.setData(jsonResponse);
                            return;
                        }


                    } catch(Exception e) {
                        e.printStackTrace();
                    }

                    tapResultsContainer.setWarningText(1, "NO TAPS FOUND FROM SPECIFICATION!");


                });

            } catch (Exception e) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(android.view.View.GONE);
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
                e.printStackTrace();
            }
        }).start();
    }
}
