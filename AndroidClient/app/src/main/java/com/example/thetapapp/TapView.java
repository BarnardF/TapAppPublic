package com.example.thetapapp;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.squareup.picasso.Picasso;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class TapView extends AppCompatActivity {

    private String API_URL = "http://taptasticitdma.freedynamicdns.org:3000/api/public/taps/";

    private TextView m_title;
    private TextView m_description;
    private ImageView m_imageView;
    private TextView m_material;
    private TextView m_containerType;
    private TextView m_size;
    private TextView m_flow;
    private TextView m_liquidType;
    private Button m_backHomeButton;
    private Button m_backListButton;
    private Button m_emailButton;
    private JSONObject jsonObject;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tap_view);

        m_title =  findViewById(R.id.tapTitle);
        m_description = findViewById(R.id.tapDescription);
        m_imageView = findViewById(R.id.tapImage);
        m_material = findViewById(R.id.tapMaterial);
        m_containerType = findViewById(R.id.tapContainerType);
        m_size = findViewById(R.id.tapSize);
        m_flow = findViewById(R.id.tapFlow);
        m_liquidType = findViewById(R.id.tapLiquidType);
        m_backHomeButton = findViewById(R.id.btnBackToHome);
        m_backListButton = findViewById(R.id.btnBackToList);
        m_emailButton = findViewById(R.id.btnEmail);

        m_backHomeButton.setOnClickListener(v -> backToHome());
        m_backListButton.setOnClickListener(v -> backToList());
        m_emailButton.setOnClickListener(v -> sendEmail());

        String filtersJson = getIntent().getStringExtra("filters");
        if (filtersJson != null) {
            fetchTapDetail(filtersJson);
        } else {
            Toast.makeText(this, "No filters provided", Toast.LENGTH_SHORT).show();
        }
    }


    private void fetchTapDetail(String filtersJson) {
        new Thread(() -> {
            try {

                URL url = new URL(API_URL + filtersJson);
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
                Object dataObj = jsonResponse.get("data");

                if (dataObj instanceof JSONArray) {
                    jsonObject = ((JSONArray) dataObj).getJSONObject(0);
                } else {
                    jsonObject = (JSONObject) dataObj;
                }

                runOnUiThread(() -> {
                    m_title.setText(jsonObject.optString("title"));
                    m_description.setText(jsonObject.optString("description"));
                    m_material.setText(jsonObject.optString("material"));
                    m_containerType.setText(jsonObject.optString("container"));
                    m_size.setText(jsonObject.optString("size"));
                    m_flow.setText(jsonObject.optString("flow"));
                    m_liquidType.setText(jsonObject.optString("category"));

                    String imageURL = jsonObject.optString("image_url");

                    Picasso.get()
                            .load(imageURL)
                            .into(m_imageView);
                });

            }catch(Exception e) {
                e.getMessage();
            }
        }).start();
    }

    private void sendEmail() {
        String title = jsonObject.optString("title", "No Title");
        String description = jsonObject.optString("description", "No Description");
        String material = jsonObject.optString("material", "N/A");
        String container = jsonObject.optString("container", "N/A");
        String size = jsonObject.optString("size", "N/A");
        String flow = jsonObject.optString("flow", "N/A");
        String category = jsonObject.optString("category", "N/A");

        String subject = "Product Details: " + title;
        String body = "Product details:\n\n" +
                "Title: " + title + "\n" +
                "Description: " + description + "\n" +
                "Material: " + material + "\n" +
                "Container: " + container + "\n" +
                "Size: " + size + "\n" +
                "Flow: " + flow + "\n" +
                "Category: " + category + "\n";

        Intent intent = new Intent(Intent.ACTION_SENDTO);
        intent.setData(Uri.parse("mailto:"));
        intent.putExtra(Intent.EXTRA_EMAIL, new String[]{"business@tapapp.co.za"});
        intent.putExtra(Intent.EXTRA_SUBJECT, subject);
        intent.putExtra(Intent.EXTRA_TEXT, body);

        try {
            startActivity(Intent.createChooser(intent, "Send Email"));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "No email app found", Toast.LENGTH_SHORT).show();
        }

    }
    private void backToHome() {
        Intent intent = new Intent(TapView.this, MainActivity.class);
        startActivity(intent);
    }
    private void backToList() {
        Intent intent = new Intent(TapView.this, ViewAllTapsActivity.class);
        startActivity(intent);
    }
}
